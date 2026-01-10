export interface CfbfClsidRecord {
	/** Human-friendly label */
	name: string
	/** Canonical GUID string: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (case-insensitive) */
	clsid: string
	/** Detected file extension to report */
	ext: string
	/** Detected file MIME type */
	mime: string
}

export const CFBF_CLSIDS: readonly CfbfClsidRecord[] = [
	{
		name: 'Microsoft Word 97-2003 Document (Word.Document.8)',
		clsid: '00020906-0000-0000-c000-000000000046',
		ext: 'doc',
		mime: 'application/msword'
	},
	{
		name: 'Microsoft Word 6-95 Document',
		clsid: '00020900-0000-0000-c000-000000000046',
		ext: 'doc',
		mime: 'application/msword'
	},
	{
		name: 'Microsoft Excel 5-95 Worksheet',
		clsid: '00020810-0000-0000-c000-000000000046',
		ext: 'xls',
		mime: 'application/vnd.ms-excel'
	},
	{
		name: 'Microsoft Excel 97-2003 Worksheet (Excel.Sheet.8)',
		clsid: '00020820-0000-0000-c000-000000000046',
		ext: 'xls',
		mime: 'application/vnd.ms-excel'
	},
	{
		name: 'Microsoft PowerPoint 97-2003 Presentation (PowerPoint.Show.8)',
		clsid: '64818d10-4f9b-11cf-86ea-00aa00b929e8',
		ext: 'ppt',
		mime: 'application/vnd.ms-powerpoint'
	},
	{
		name: 'Microsoft PowerPoint 4.0 Presentation',
		clsid: '00044851-0000-0000-c000-000000000046',
		ext: 'ppt',
		mime: 'application/vnd.ms-powerpoint'
	},
	{
		name: 'Microsoft Visio 2000-2002 Drawing',
		clsid: '00021a13-0000-0000-c000-000000000046',
		ext: 'vsd',
		mime: 'application/vnd.visio'
	},
	{
		name: 'Microsoft Visio 2003-2010 Drawing',
		clsid: '00021a14-0000-0000-c000-000000000046',
		ext: 'vsd',
		mime: 'application/vnd.visio'
	},
	{
		name: 'Windows Installer Package',
		clsid: '000c1084-0000-0000-c000-000000000046',
		ext: 'msi',
		mime: 'application/x-msi'
	}
] as const
