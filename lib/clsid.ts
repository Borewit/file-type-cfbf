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
		name: 'Windows Installer Package',
		clsid: '000c1084-0000-0000-c000-000000000046',
		ext: 'msi',
		mime: 'application/x-msi'
	}
] as const
