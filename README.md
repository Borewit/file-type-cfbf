[![NPM version](https://img.shields.io/npm/v/@file-type/cfbf.svg)](https://npmjs.org/package/@file-type/cfbf)
[![Node.js CI](https://github.com/Borewit/file-type-cfbf/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/Borewit/file-type-cfbf/actions/workflows/nodejs-ci.yml)
[![npm downloads](http://img.shields.io/npm/dm/@file-type/cfbf.svg)](https://npmcharts.com/compare/@file-type/cfbf?start=365)

# @file-type/cfbf

Detector plugin for [file-type](https://github.com/sindresorhus/file-type) that identifies files based on the [Compound File Binary Format](https://en.wikipedia.org/wiki/Compound_File_Binary_Format),
commonly known as CFBF or OLE Compound Document.

CFBF is a container format used by many legacy Microsoft Office files and other Windows applications. This plugin detects the container itself, not the specific document content inside it.

## Installation

```bash
npm install @file-type/cfbf
```

## Usage

The following example shows how add the CFBF detector to [file-type](https://github.com/sindresorhus/file-type).
```js
import {FileTypeParser} from 'file-type';
import {detectCfbf} from '@file-type/cfbf';

const parser = new FileTypeParser({customDetectors: [detectCfbf]});
const fileType = await parser.fromFile('smaple.doc');
console.log(fileType);
```

## Support file formats

This detector identifies files that use the [Compound File Binary Format](https://en.wikipedia.org/wiki/Compound_File_Binary_Format) Format container:

### Microsoft Office legacy formats

These are pre-Office Open XML binary Office formats (CFBF/OLE),
used by Microsoft Office prior to Office 2007:
- `.doc` Microsoft Word documents (Word 6.0/95, Word 97–2003)
- `.ppt` Microsoft PowerPoint presentations (PowerPoint 4.0, 7.0/95, 97–2003)
- `.vsd` Microsoft Visio drawings (2000–2002, 2003–2010)
- `.xls` Microsoft Excel spreadsheets (Excel 5.0/95, Excel 97–2003)

Other files:
- `.msi`  [Windows installer files](https://en.wikipedia.org/wiki/Windows_Installer)

## Licence

This project is licensed under the [MIT License](LICENSE.txt). Feel free to use, modify, and distribute as needed.
