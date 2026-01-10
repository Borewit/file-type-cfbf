export class Guid {
	private readonly bytes: Uint8Array

	public constructor(bytes: Uint8Array) {
		if (bytes.length !== 16) {
			throw new Error('GUID must be exactly 16 bytes')
		}
		this.bytes = bytes;
	}

	/**
	 * Parse canonical GUID string (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
	 * into Windows / CFBF byte order.
	 */
	public static fromString(guid: string): Guid {
		const s = guid.trim().toLowerCase()

		if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s)) {
			throw new Error(`Invalid GUID format: ${guid}`);
		}

		const [g1, g2, g3, g4, g5] = s.split('-')

		const toBytes = (hex: string) => {
			const out = new Uint8Array(hex.length / 2)
			for (let i = 0, j = 0; i < hex.length; i += 2, j++) {
				out[j] = parseInt(hex.slice(i, i + 2), 16);
			}
			return out;
		}

		const bytes = new Uint8Array(16);

		bytes.set(toBytes(g1).reverse(), 0);  // uint32 LE
		bytes.set(toBytes(g2).reverse(), 4);  // uint16 LE
		bytes.set(toBytes(g3).reverse(), 6);  // uint16 LE
		bytes.set(toBytes(g4), 8);           // as-is
		bytes.set(toBytes(g5), 10);           // as-is

		return new Guid(bytes);
	}

	/**
	 * Compare against a Uint8Array containing GUID bytes
	 * in Windows / CFBF layout.
	 */
	equals(buf: Uint8Array, offset = 0): boolean {
		if (buf.length - offset < 16) return false;

		for (let i = 0; i < 16; i++) {
			if (buf[offset + i] !== this.bytes[i]) return false;
		}
		return true;
	}
}
