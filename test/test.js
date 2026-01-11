import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'mocha';
import {fromFile} from 'strtok3';
import {assert} from 'chai';

import {detectCfbf} from '../lib/index.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

import {Guid} from '../lib/guid.js';

function getSamplePath(filename) {
	return path.join(dirname, 'fixture', filename);
}

describe('Guid', () => {
	it('should parse from a string GUID', () => {
		const cfbf_doc_guid = '00020906-0000-0000-C000-000000000046';

		const docClsid = new Uint8Array([
			0x06, 0x09, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x46
		]);

		const guid = Guid.fromString(cfbf_doc_guid);
		assert.isTrue(guid.equals(docClsid));
	});

	it('should throw on invalid GUID strings', () => {
		// Bad characters
		assert.throws(() => {
			Guid.fromString('00020906-0000-0000-C000-00000000004Z');
		}, /Invalid GUID format/i);

		// Missing dashes / wrong shape
		assert.throws(() => {
			Guid.fromString('0002090600000000C000000000000046');
		}, /Invalid GUID format/i);

		// Wrong group lengths
		assert.throws(() => {
			Guid.fromString('00020906-0000-000-C000-000000000046');
		}, /Invalid GUID format/i);

		// Empty
		assert.throws(() => {
			Guid.fromString('');
		}, /Invalid GUID format/i);
	});

	it('should return false when comparing against non-matching bytes', () => {
		const guid = Guid.fromString('00020906-0000-0000-C000-000000000046');

		const different = new Uint8Array([
			0x07, 0x09, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x46
		]);

		assert.isFalse(guid.equals(different));
	});

	it('should return false when buffer is too short or offset is out of range', () => {
		const guid = Guid.fromString('00020906-0000-0000-C000-000000000046');

		assert.isFalse(guid.equals(new Uint8Array(0)));
		assert.isFalse(guid.equals(new Uint8Array(15)));

		const buf = new Uint8Array(16);
		assert.isFalse(guid.equals(buf, 1)); // not enough remaining bytes
		assert.isFalse(guid.equals(buf, -1)); // invalid offset
	});
});

describe('CFBF detector', () => {

	it('should return undefined on any other file', async () => {
		const samplePath = getSamplePath('other.txt');
		const tokenizer = await fromFile(samplePath);
		try {
			const fileType = await detectCfbf.detect(tokenizer);
			assert.isUndefined(fileType);
			assert.strictEqual(tokenizer.position, 0, 'position should be be advanced');
		} finally {
			await tokenizer.close();
		}
	});

	it('should detect Microsoft Word 97-2003 Document', async () => {
		const samplePath = getSamplePath('sample1.doc');
		const tokenizer = await fromFile(samplePath);
		try {
			const fileType = await detectCfbf.detect(tokenizer);
			assert.isDefined(fileType, 'should detect the file type');
			assert.strictEqual(fileType.mime, 'application/msword');
			assert.strictEqual(fileType.ext, 'doc');
			assert.strictEqual(fileType.name, 'Microsoft Word 97-2003 Document (Word.Document.8)');
		} finally {
			await tokenizer.close();
		}
	});

	it('should detect Microsoft Microsoft Word 6-95 Document', async () => {
		const samplePath = getSamplePath('CRED01.DOT');
		const tokenizer = await fromFile(samplePath);
		try {
			const fileType = await detectCfbf.detect(tokenizer);
			assert.isDefined(fileType, 'should detect the file type');
			assert.strictEqual(fileType.mime, 'application/msword');
			assert.strictEqual(fileType.ext, 'doc');
			assert.strictEqual(fileType.name, 'Microsoft Word 6-95 Document');
		} finally {
			await tokenizer.close();
		}
	});

	it('should detect Microsoft Excel 97-2003 Worksheet', async () => {
		const samplePath = getSamplePath('sample1.xls');
		const tokenizer = await fromFile(samplePath);
		try {
			const fileType = await detectCfbf.detect(tokenizer);
			assert.isDefined(fileType, 'should detect the file type');
			assert.strictEqual(fileType.mime, 'application/vnd.ms-excel');
			assert.strictEqual(fileType.ext, 'xls');
			assert.strictEqual(fileType.name, 'Microsoft Excel 97-2003 Worksheet (Excel.Sheet.8)');
		} finally {
			await tokenizer.close();
		}
	});

	it('should detect Microsoft PowerPoint 97-2003 Presentation', async () => {
		const samplePath = getSamplePath('sample1.ppt');
		const tokenizer = await fromFile(samplePath);
		try {
			const fileType = await detectCfbf.detect(tokenizer);
			assert.isDefined(fileType, 'should detect the file type');
			assert.strictEqual(fileType.mime, 'application/vnd.ms-powerpoint');
			assert.strictEqual(fileType.ext, 'ppt');
			assert.strictEqual(fileType.name, 'Microsoft PowerPoint 97-2003 Presentation (PowerPoint.Show.8)');
		} finally {
			await tokenizer.close();
		}
	});

	it('should detect Microsoft Visio 2000-2002 Drawing', async () => {
		const samplePath = getSamplePath('Perspective Block Diagram.vsd');
		const tokenizer = await fromFile(samplePath);
		try {
			const fileType = await detectCfbf.detect(tokenizer);
			assert.isDefined(fileType, 'should detect the file type');
			assert.strictEqual(fileType.mime, 'application/vnd.visio');
			assert.strictEqual(fileType.ext, 'vsd');
			assert.strictEqual(fileType.name, 'Microsoft Visio 2000-2002 Drawing');
		} finally {
			await tokenizer.close();
		}
	});

	it('should detect Microsoft Visio 2003-2010 Drawing', async () => {
		const samplePath = getSamplePath('XFUNCH_U.VSS');
		const tokenizer = await fromFile(samplePath);
		try {
			const fileType = await detectCfbf.detect(tokenizer);
			assert.isDefined(fileType, 'should detect the file type');
			assert.strictEqual(fileType.mime, 'application/vnd.visio');
			assert.strictEqual(fileType.ext, 'vsd');
			assert.strictEqual(fileType.name, 'Microsoft Visio 2003-2010 Drawing');
		} finally {
			await tokenizer.close();
		}
	});

	it('should detect Microsoft Publisher 5.0/98', async () => {
		const samplePath = getSamplePath('ZMSPUB.PUB');
		const tokenizer = await fromFile(samplePath);
		try {
			const fileType = await detectCfbf.detect(tokenizer);
			assert.isDefined(fileType, 'should detect the file type');
			assert.strictEqual(fileType.mime, 'application/x-mspublisher');
			assert.strictEqual(fileType.ext, 'pub');
			assert.strictEqual(fileType.name, 'Microsoft Publisher 5.0/98');
		} finally {
			await tokenizer.close();
		}
	});

	it('should detect Microsoft Publisher 3.0/95-4.0/97', async () => {
		const samplePath = getSamplePath('XOFF.PUB');
		const tokenizer = await fromFile(samplePath);
		try {
			const fileType = await detectCfbf.detect(tokenizer);
			assert.isDefined(fileType, 'should detect the file type');
			assert.strictEqual(fileType.mime, 'application/x-mspublisher');
			assert.strictEqual(fileType.ext, 'pub');
			assert.strictEqual(fileType.name, 'Microsoft Publisher 3.0/95-4.0/97');
		} finally {
			await tokenizer.close();
		}
	});

	it('should detect .msi (Windows Installer Package)', async () => {
		const samplePath = getSamplePath('fixture.msi');
		const tokenizer = await fromFile(samplePath);
		try {
			const fileType = await detectCfbf.detect(tokenizer);
			assert.isDefined(fileType, 'should detect the file type');
			assert.strictEqual(fileType.mime, 'application/x-msi');
			assert.strictEqual(fileType.ext, 'msi');
			assert.strictEqual(fileType.name, 'Windows Installer Package');
		} finally {
			await tokenizer.close();
		}
	});
});

