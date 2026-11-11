import type { ITokenizer } from 'strtok3';
import { Guid } from 'win-guid';
import type { Detector, FileTypeResult } from 'file-type';
import { CFBF_CLSIDS } from './clsid.js';

/** Supported file extensions from the CLSID database. */
export const supportedExtensions: ReadonlySet<string> = new Set(CFBF_CLSIDS.map(record => record.ext));

/** Supported MIME types from the CLSID database. */
export const supportedMimeTypes: ReadonlySet<string> = new Set(CFBF_CLSIDS.map(record => record.mime));

const guidCache = new Map<string, Guid>();

export interface NamedFileTypeResult extends FileTypeResult {
	name: string;
}

export const detectCfbf: Detector = {
	id: 'cfbf',
	detect: async (tokenizer: ITokenizer):  Promise<NamedFileTypeResult | undefined> => {
		// CFBF signature: D0 CF 11 E0 A1 B1 1A E1
		const cfbfSignature = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]

		// Read minimum header bytes needed (52 bytes covers signature + sector shift + directory sector location)
		const headerBuffer = new Uint8Array(52)
		const headerBytesRead = await tokenizer.peekBuffer(headerBuffer, {
			length: 52,
			mayBeLess: true
		})

		// Need at least 52 bytes to read required header fields
		if (headerBytesRead < 52) {
			return undefined;
		}

		// Check CFBF signature
		if (!cfbfSignature.every((value, index) => value === headerBuffer[index])) {
			return undefined;
		}

		// Validate sector shift (offset 30): must be 9 (512-byte sectors) or 12 (4096-byte sectors)
		const sectorShift = headerBuffer[30]
		if (sectorShift !== 9 && sectorShift !== 12) {
			return undefined;
		}
		const sectorSize = 1 << sectorShift;

		// Read _sectDirStart (offset 48-51, little-endian unsigned 32-bit)
		// This is the sector number of the first directory sector
		// Note: JS bitwise ops return signed 32-bit ints, so values >= 0x80000000
		// become negative. Use >>> 0 to reinterpret as unsigned for spec compliance.
		const sectDirStart =
			(headerBuffer[48] |
				(headerBuffer[49] << 8) |
				(headerBuffer[50] << 16) |
				(headerBuffer[51] << 24)) >>>
			0

		// Check for special values per MS-CFB spec:
		// ENDOFCHAIN (0xFFFFFFFE) = end of sector chain
		// FREESECT (0xFFFFFFFF) = unallocated sector
		if (sectDirStart >= 0xfffffffe) {
			return undefined;
		}

		// Calculate CLSID location in file:
		// - One full sector for the header: 512 bytes in v3, 4096 in v4
		//   [MS-CFB] 2.2 requires 3584 bytes of zero padding after the v4 header:
		//   https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-cfb/05060311-bfce-4b12-874d-71fd4ce63aea
		// - sectDirStart * sectorSize to reach directory sector
		// - 80 bytes offset to CLSID within root directory entry
		const clsidOffset = (sectDirStart + 1) * sectorSize + 80;
		const clsidPosition = tokenizer.position + clsidOffset;

		if (tokenizer.fileInfo.size !== undefined && clsidPosition + 16 > tokenizer.fileInfo.size) {
			return undefined;
		}

		// Read only the CLSID; random-access inputs do not buffer the preceding contents.
		const buffer = new Uint8Array(16)
		const bytesRead = await tokenizer.peekBuffer(buffer, {
			position: clsidPosition,
			length: 16,
			mayBeLess: true
		});

		if (bytesRead < 16) {
			return undefined;
		}

		// Retrieves and caches GUIDs
		function getGuid(clsid: string): Guid {
			let guid = guidCache.get(clsid);
			if (!guid) {
				guid = Guid.fromString(clsid);
				guidCache.set(clsid, guid);
			}
			return guid;
		}

		// Match against CLSID database
		for (const record of CFBF_CLSIDS) {
			const guid = getGuid(record.clsid)
			if (guid.equals(buffer, 0)) {
				return {
					ext: record.ext,
					mime: record.mime,
					name: record.name
				}
			}
		}

		return undefined;
	}
};
