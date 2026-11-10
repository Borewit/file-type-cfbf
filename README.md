[![NPM version](https://img.shields.io/npm/v/file-type-cfbf-plus.svg)](https://www.npmjs.com/package/file-type-cfbf-plus)
[![Node.js CI](https://github.com/mosharov/file-type-cfbf-plus/actions/workflows/nodejs-ci.yml/badge.svg?branch=master)](https://github.com/mosharov/file-type-cfbf-plus/actions/workflows/nodejs-ci.yml)
[![npm downloads](https://img.shields.io/npm/dm/file-type-cfbf-plus.svg)](https://www.npmjs.com/package/file-type-cfbf-plus)

# file-type-cfbf-plus

Fork of [`@file-type/cfbf`](https://github.com/Borewit/file-type-cfbf), based on version `0.2.2`, with Outlook `.msg` recognition enabled. It also corrects root CLSID offsets for CFB version 4 (4096-byte sectors).

Detector plugin for [file-type](https://github.com/sindresorhus/file-type) that identifies files based on the [Compound File Binary Format](https://en.wikipedia.org/wiki/Compound_File_Binary_Format),
commonly known as CFBF or OLE Compound Document.

CFBF is a container format used by many legacy Microsoft Office files and other Windows applications. This plugin identifies supported formats by the CLSID in the CFBF root directory entry. Outlook MSG recognition uses CLSID `00020d0b-0000-0000-c000-000000000046` and returns MIME type `application/vnd.ms-outlook`. It does not parse message bodies or attachments, or validate the complete document structure. Unknown or absent CLSIDs are not identified by this detector.

## Installation

```sh
yarn add file-type-cfbf-plus
```

```sh
npm install file-type-cfbf-plus
```

## Usage

The following example shows how add the CFBF detector to [file-type](https://github.com/sindresorhus/file-type).
```js
import {FileTypeParser} from 'file-type';
import {detectCfbf} from 'file-type-cfbf-plus';

const parser = new FileTypeParser({customDetectors: [detectCfbf]});
const fileType = await parser.fromFile('sample.msg');
console.log(fileType);
```

## API

### supportedExtensions

A `Set<string>` of file extensions detectable by this plugin, without a leading dot. The TypeScript type is `ReadonlySet<string>`, as in `file-type`.

### supportedMimeTypes

A `Set<string>` of MIME types detectable by this plugin. The TypeScript type is `ReadonlySet<string>`, as in `file-type`.

Both sets are derived from the CLSID database, with duplicate values removed. They describe the plugin's detection capabilities and do not automatically extend the supported sets exported by `file-type`.

```js
import {supportedExtensions, supportedMimeTypes} from 'file-type-cfbf-plus';

console.log(supportedExtensions.has('doc')); // true
console.log(supportedExtensions.has('docx')); // false
console.log(supportedMimeTypes.has('application/vnd.ms-outlook')); // true
console.log(supportedMimeTypes.has('text/plain')); // false
```

For capability checks across the standard detectors and this plugin, combine the corresponding sets from both packages.

## Support file formats

This detector identifies files that use the [Compound File Binary Format](https://en.wikipedia.org/wiki/Compound_File_Binary_Format) Format container:

### Microsoft Office legacy formats

These are pre-Office Open XML binary Office formats (CFBF/OLE),
used by Microsoft Office prior to Office 2007:
- `.doc` Microsoft Word documents (Word 6.0/95, Word 97–2003)
- `.pub` Microsoft Publisher documents (Publisher 3.0/95-4.0/97, Publisher 5.0/98)
- `.ppt` Microsoft PowerPoint presentations (PowerPoint 4.0, 7.0/95, 97–2003)
- `.vsd` Microsoft Visio drawings (2000–2002, 2003–2010)
- `.wps` Microsoft Works 7–9 Word Processor Document
- `.xls` Microsoft Excel spreadsheets (Excel 5.0/95, Excel 97–2003)

Other files:
- `.msg` Microsoft Outlook items (`application/vnd.ms-outlook`)
- `.msi`  [Windows installer files](https://en.wikipedia.org/wiki/Windows_Installer)

## Repository automation

See [GitHub Actions and Dependabot setup](.github/AUTOMATION.md).

## Licence

The original project is by [Borewit](https://github.com/Borewit). Original copyright and license notices are retained. This fork is licensed under the [MIT License](LICENSE.txt). Feel free to use, modify, and distribute as needed.
