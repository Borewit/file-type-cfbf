import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'mocha';
import {fromBuffer, fromFile} from 'strtok3';
import {FileTypeParser} from 'file-type';
import {assert} from 'chai';

import {detectCfbf} from '../lib/index.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

function getSamplePath(filename) {
	return path.join(dirname, 'fixture', filename);
}

const outlookClsid = [0x0b, 0x0d, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00,
	0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x46];

// Metadata-only fixtures exercise CLSID recognition, not complete MSG validation.
function cfbMetadata(clsid = outlookClsid, directorySector = 0, sectorSize = 512) {
	const rootOffset = (directorySector + 1) * sectorSize;
	const bytes = new Uint8Array(rootOffset + sectorSize);
	const view = new DataView(bytes.buffer);
	bytes.set([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
	view.setUint16(26, sectorSize === 512 ? 3 : 4, true);
	view.setUint16(28, 0xfffe, true);
	view.setUint16(30, sectorSize === 512 ? 9 : 12, true);
	view.setUint16(32, 6, true);
	view.setUint32(48, directorySector, true);
	bytes[rootOffset + 66] = 5;
	bytes.set(clsid, rootOffset + 80);
	return bytes;
}

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

describe('Outlook MSG CLSID detection', () => {
	for (const directorySector of [0, 7]) {
		it(`recognizes Outlook CLSID in directory sector ${directorySector}`, async () => {
			const tokenizer = fromBuffer(cfbMetadata(outlookClsid, directorySector));
			assert.deepEqual(await detectCfbf.detect(tokenizer), {
				ext: 'msg',
				mime: 'application/vnd.ms-outlook',
				name: 'Microsoft Outlook Item'
			});
			assert.strictEqual(tokenizer.position, 0);
		});
	}

	for (const directorySector of [0, 3]) {
		it(`recognizes Outlook CLSID in a version 4 CFB, directory sector ${directorySector}`, async () => {
			const tokenizer = fromBuffer(cfbMetadata(outlookClsid, directorySector, 4096));
			const result = await detectCfbf.detect(tokenizer);
			assert.strictEqual(result?.ext, 'msg');
			assert.strictEqual(result?.mime, 'application/vnd.ms-outlook');
			assert.strictEqual(tokenizer.position, 0);
		});
	}

	it('returns MSG through the public file-type custom detector API', async () => {
		const parser = new FileTypeParser({customDetectors: [detectCfbf]});
		const result = await parser.fromBuffer(cfbMetadata());
		assert.strictEqual(result.ext, 'msg');
		assert.strictEqual(result.mime, 'application/vnd.ms-outlook');
	});

	for (const [name, clsid] of [
		['zero CLSID', new Uint8Array(16)],
		['Outlook template CLSID', [0x46, 0xf0, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00,
			0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x46]]
	]) {
		it(`does not classify ${name} as MSG`, async () => {
			const tokenizer = fromBuffer(cfbMetadata(clsid));
			assert.isUndefined(await detectCfbf.detect(tokenizer));
			assert.strictEqual(tokenizer.position, 0);
		});
	}

	it('returns undefined when the Outlook CLSID is truncated', async () => {
		const tokenizer = fromBuffer(cfbMetadata().subarray(0, 512 + 80 + 15));
		assert.isUndefined(await detectCfbf.detect(tokenizer));
		assert.strictEqual(tokenizer.position, 0);
	});

	it('requires a CFB signature even if Outlook CLSID bytes are present', async () => {
		const bytes = cfbMetadata();
		bytes[0] = 0;
		assert.isUndefined(await detectCfbf.detect(fromBuffer(bytes)));
	});
	for (const length of [0, 8, 51]) {
		it(`returns undefined for an incomplete ${length}-byte header`, async () => {
			const tokenizer = fromBuffer(cfbMetadata().subarray(0, length));
			assert.isUndefined(await detectCfbf.detect(tokenizer));
			assert.strictEqual(tokenizer.position, 0);
		});
	}

	for (const sectorShift of [0, 8, 10, 13]) {
		it(`rejects unsupported sector shift ${sectorShift}`, async () => {
			const bytes = cfbMetadata();
			new DataView(bytes.buffer).setUint16(30, sectorShift, true);
			assert.isUndefined(await detectCfbf.detect(fromBuffer(bytes)));
		});
	}

	for (const directorySector of [0xfffffffe, 0xffffffff]) {
		it(`rejects special directory-sector marker 0x${directorySector.toString(16)}`, async () => {
			const bytes = cfbMetadata();
			new DataView(bytes.buffer).setUint32(48, directorySector, true);
			assert.isUndefined(await detectCfbf.detect(fromBuffer(bytes)));
		});
	}

	it('rejects an unknown nonzero root CLSID', async () => {
		assert.isUndefined(await detectCfbf.detect(fromBuffer(cfbMetadata(new Uint8Array(16).fill(0xff)))));
	});

	it('does not scan message payload bytes for an Outlook CLSID', async () => {
		const bytes = cfbMetadata(new Uint8Array(16));
		bytes.set(outlookClsid, 800);
		assert.isUndefined(await detectCfbf.detect(fromBuffer(bytes)));
	});

	it('leaves unknown CFB types available to the standard file-type detector', async () => {
		const parser = new FileTypeParser({customDetectors: [detectCfbf]});
		assert.deepEqual(await parser.fromBuffer(cfbMetadata(new Uint8Array(16))), {
			ext: 'cfb', mime: 'application/x-cfb'
		});
	});

});
