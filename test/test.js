import path from 'node:path';
import {Readable} from 'node:stream';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'mocha';
import {fromBuffer, fromFile, fromStream} from 'strtok3';
import {FileTypeParser} from 'file-type';
import {assert} from 'chai';

import * as cfbf from 'file-type-cfbf-plus';

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

describe('Supported formats', () => {
	it('exports the unique supported extensions as a Set through the package entry point', () => {
		assert.instanceOf(cfbf.supportedExtensions, Set);
		assert.sameMembers([...cfbf.supportedExtensions], [
			'doc', 'xls', 'ppt', 'msg', 'vsd', 'pub', 'wps', 'msi'
		]);
	});

	it('exports the unique supported MIME types as a Set through the package entry point', () => {
		assert.instanceOf(cfbf.supportedMimeTypes, Set);
		assert.sameMembers([...cfbf.supportedMimeTypes], [
			'application/msword',
			'application/vnd.ms-excel',
			'application/vnd.ms-powerpoint',
			'application/vnd.ms-outlook',
			'application/vnd.visio',
			'application/x-mspublisher',
			'application/vnd.ms-works',
			'application/x-msi'
		]);
	});

	it('does not advertise container, text or unrelated extensions', () => {
		assert.instanceOf(cfbf.supportedExtensions, Set);
		for (const extension of ['cfb', 'txt', 'csv', 'pdf', 'docx']) {
			assert.isFalse(cfbf.supportedExtensions.has(extension), extension);
		}
	});

	it('does not advertise container, text or unrelated MIME types', () => {
		assert.instanceOf(cfbf.supportedMimeTypes, Set);
		for (const mimeType of ['application/x-cfb', 'text/plain', 'text/csv', 'application/pdf']) {
			assert.isFalse(cfbf.supportedMimeTypes.has(mimeType), mimeType);
		}
	});

	it('includes detected Office and Outlook formats in both public sets', async () => {
		assert.instanceOf(cfbf.supportedExtensions, Set);
		assert.instanceOf(cfbf.supportedMimeTypes, Set);
		const parser = new FileTypeParser({customDetectors: [cfbf.detectCfbf]});
		const results = [];
		for (const filename of ['sample1.doc', 'sample1.xls', 'sample1.ppt']) {
			results.push(await parser.fromFile(getSamplePath(filename)));
		}
		results.push(await parser.fromBuffer(cfbMetadata()));
		for (const result of results) {
			assert.isDefined(result);
			assert.isTrue(cfbf.supportedExtensions.has(result.ext), result.ext);
			assert.isTrue(cfbf.supportedMimeTypes.has(result.mime), result.mime);
		}
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

// Fail before a regression can exhaust the test process's memory.
async function withoutLargeAllocations(run) {
	const NativeUint8Array = globalThis.Uint8Array;
	globalThis.Uint8Array = new Proxy(NativeUint8Array, {
		construct(target, args, newTarget) {
			if (typeof args[0] === 'number' && args[0] > 64 * 1024) {
				throw new RangeError('Detector allocation exceeded 64 KiB');
			}
			return Reflect.construct(target, args, newTarget);
		}
	});
	try {
		return await run();
	} finally {
		globalThis.Uint8Array = NativeUint8Array;
	}
}

describe('CFBF detection memory bounds', () => {
	for (const directorySector of [262143, 0xfffffffd]) {
		it(`rejects a 52-byte buffer with distant directory sector ${directorySector} without large allocations`, async () => {
			const bytes = cfbMetadata(outlookClsid, 0, 4096).slice(0, 52);
			new DataView(bytes.buffer).setUint32(48, directorySector, true);
			const tokenizer = fromBuffer(bytes);
			const result = await withoutLargeAllocations(() => detectCfbf.detect(tokenizer));
			assert.isUndefined(result);
			assert.strictEqual(tokenizer.position, 0);
		});
	}

	for (const sizeMiB of [50, 100]) {
		it(`recognizes a CLSID at the end of a ${sizeMiB} MiB buffer without allocating its prefix`, async () => {
			const directorySector = sizeMiB * 1024 * 1024 / 512 - 2;
			const tokenizer = fromBuffer(cfbMetadata(outlookClsid, directorySector));
			const parser = new FileTypeParser({customDetectors: [detectCfbf]});
			const result = await withoutLargeAllocations(() => parser.fromTokenizer(tokenizer));
			assert.strictEqual(result?.ext, 'msg');
			assert.strictEqual(result?.mime, 'application/vnd.ms-outlook');
			assert.strictEqual(tokenizer.position, 0);
		});
	}

	it('recognizes a CLSID relative to the current tokenizer position', async () => {
		const bytes = new Uint8Array(16 + 1024);
		bytes.set(cfbMetadata(), 16);
		const tokenizer = fromBuffer(bytes);
		await tokenizer.ignore(16);
		const result = await detectCfbf.detect(tokenizer);
		assert.strictEqual(result?.ext, 'msg');
		assert.strictEqual(tokenizer.position, 16);
	});
});

describe('CFBF read boundaries', () => {
	for (const [directorySector, sectorSize] of [[4095, 512], [3, 4096]]) {
		it(`recognizes a stream CLSID in sector ${directorySector} with ${sectorSize}-byte sectors without consuming it`, async () => {
			const bytes = cfbMetadata(outlookClsid, directorySector, sectorSize);
			const tokenizer = await fromStream(Readable.from([bytes], {objectMode: false}));
			try {
				const result = await detectCfbf.detect(tokenizer);
				assert.strictEqual(result?.ext, 'msg');
				assert.strictEqual(tokenizer.position, 0);
				const header = new Uint8Array(8);
				await tokenizer.peekBuffer(header);
				assert.deepEqual([...header], [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
			} finally {
				await tokenizer.close();
			}
		});
	}

	it('rejects an offset beyond a known stream size before buffering the prefix', async () => {
		const bytes = cfbMetadata().slice(0, 52);
		new DataView(bytes.buffer).setUint32(48, 255, true);
		const tokenizer = await fromStream(Readable.from([bytes], {objectMode: false}), {
			fileInfo: {size: bytes.length}
		});
		try {
			const result = await withoutLargeAllocations(() => detectCfbf.detect(tokenizer));
			assert.isUndefined(result);
			assert.strictEqual(tokenizer.position, 0);
		} finally {
			await tokenizer.close();
		}
	});

	it('recognizes a CLSID ending exactly at the known file size', async () => {
		const tokenizer = fromBuffer(cfbMetadata().slice(0, 608));
		const result = await detectCfbf.detect(tokenizer);
		assert.strictEqual(result?.ext, 'msg');
		assert.strictEqual(tokenizer.position, 0);
	});

	it('rejects a truncated CLSID in a stream with unknown size', async () => {
		const bytes = cfbMetadata().slice(0, 607);
		const tokenizer = await fromStream(Readable.from([bytes], {objectMode: false}));
		try {
			assert.isUndefined(await detectCfbf.detect(tokenizer));
			assert.strictEqual(tokenizer.position, 0);
		} finally {
			await tokenizer.close();
		}
	});

	it('preserves standard CFB detection when a stream ends before a distant CLSID', async () => {
		const bytes = cfbMetadata().slice(0, 52);
		new DataView(bytes.buffer).setUint32(48, 4095, true);
		const tokenizer = await fromStream(Readable.from([bytes], {objectMode: false}));
		try {
			const parser = new FileTypeParser({customDetectors: [detectCfbf]});
			assert.deepEqual(await parser.fromTokenizer(tokenizer), {ext: 'cfb', mime: 'application/x-cfb'});
		} finally {
			await tokenizer.close();
		}
	});
});
