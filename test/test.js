import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'mocha';
import {fromFile} from 'strtok3';
import {assert} from 'chai';

import {detectCfbf} from '../lib/index.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

function getSamplePath(filename) {
	return path.join(dirname, 'fixture', filename);
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

