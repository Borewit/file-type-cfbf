import type { ITokenizer } from 'strtok3';
import type { Detector, FileTypeResult } from 'file-type';

export const detectCfbf: Detector = {
	id: 'cfbf',
	detect: async (tokenizer: ITokenizer):  Promise<FileTypeResult | undefined> => {
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
			return undefined
		}

		// Check CFBF signature
		if (!cfbfSignature.every((value, index) => value === headerBuffer[index])) {
			return undefined
		}

		// Validate sector shift (offset 30): must be 9 (512-byte sectors) or 12 (4096-byte sectors)
		const sectorShift = headerBuffer[30]
		if (sectorShift !== 9 && sectorShift !== 12) {
			return undefined
		}
		const sectorSize = 1 << sectorShift

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
			return undefined
		}

		// Calculate CLSID location in file:
		// - 512 bytes for header
		// - sectDirStart * sectorSize to reach directory sector
		// - 80 bytes offset to CLSID within root directory entry
		const clsidOffset = 512 + sectDirStart * sectorSize + 80
		const requiredLength = clsidOffset + 16

		// Read enough bytes to reach the CLSID
		const buffer = new Uint8Array(requiredLength)
		const bytesRead = await tokenizer.peekBuffer(buffer, {
			length: requiredLength,
			mayBeLess: true
		})

		// Verify we read enough bytes
		if (bytesRead < requiredLength) {
			return undefined
		}

		// Helper to check CLSID at the calculated offset
		const checkClsid = (clsid: number[]) =>
			clsid.every((value, i) => value === buffer[clsidOffset + i])

		// CLSID for .doc files: {00020906-0000-0000-C000-000000000046}
		const docClsid = [
			0x06, 0x09, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x46
		]
		if (checkClsid(docClsid)) {
			return { ext: 'doc', mime: 'application/msword' }
		}

		// CLSIDs for .xls files (two variants):
		// {00020810-0000-0000-C000-000000000046}
		// {00020820-0000-0000-C000-000000000046}
		const xlsClsid1 = [
			0x10, 0x08, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x46
		]
		const xlsClsid2 = [
			0x20, 0x08, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x46
		]
		if (checkClsid(xlsClsid1) || checkClsid(xlsClsid2)) {
			return { ext: 'xls', mime: 'application/vnd.ms-excel' }
		}

		// CLSID for .ppt files: {64818D10-4F9B-11CF-86EA-00AA00B929E8}
		const pptClsid = [
			0x10, 0x8d, 0x81, 0x64, 0x9b, 0x4f, 0xcf, 0x11, 0x86, 0xea, 0x00, 0xaa, 0x00, 0xb9, 0x29,
			0xe8
		]
		if (checkClsid(pptClsid)) {
			return { ext: 'ppt', mime: 'application/vnd.ms-powerpoint' }
		}

		// CLSID for .msi files: {000C1084-0000-0000-C000-000000000046}
		const msiClsid = [
			0x84, 0x10, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x46
		]
		if (checkClsid(msiClsid)) {
			return { ext: 'msi', mime: 'application/x-msi' }
		}

		return undefined
	}
};
