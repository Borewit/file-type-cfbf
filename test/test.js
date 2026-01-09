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

	it('should detect .doc', async () => {
		const samplePath = getSamplePath('sample1.doc');
		const tokenizer = await fromFile(samplePath);
		try {
			const fileType = await detectCfbf.detect(tokenizer);
			assert.isDefined(fileType, 'should detect the file type');
			assert.strictEqual(fileType.mime, 'application/msword');
			assert.strictEqual(fileType.ext, 'doc');
		} finally {
			await tokenizer.close();
		}
	});

	it('should detect .xls', async () => {
		const samplePath = getSamplePath('sample1.xls');
		const tokenizer = await fromFile(samplePath);
		try {
			const fileType = await detectCfbf.detect(tokenizer);
			assert.isDefined(fileType, 'should detect the file type');
			assert.strictEqual(fileType.mime, 'application/vnd.ms-excel');
			assert.strictEqual(fileType.ext, 'xls');
		} finally {
			await tokenizer.close();
		}
	});

	it('should detect .ppt', async () => {
		const samplePath = getSamplePath('sample1.ppt');
		const tokenizer = await fromFile(samplePath);
		try {
			const fileType = await detectCfbf.detect(tokenizer);
			assert.isDefined(fileType, 'should detect the file type');
			assert.strictEqual(fileType.mime, 'application/vnd.ms-powerpoint');
			assert.strictEqual(fileType.ext, 'ppt');
		} finally {
			await tokenizer.close();
		}
	});

	it('should detect .msi', async () => {
		const samplePath = getSamplePath('fixture.msi');
		const tokenizer = await fromFile(samplePath);
		try {
			const fileType = await detectCfbf.detect(tokenizer);
			assert.isDefined(fileType, 'should detect the file type');
			assert.strictEqual(fileType.mime, 'application/x-msi');
			assert.strictEqual(fileType.ext, 'msi');
		} finally {
			await tokenizer.close();
		}
	});
});

