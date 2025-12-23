import type { ITokenizer } from 'strtok3';
import type { Detector, FileTypeResult } from 'file-type';

export const detectCfbf: Detector = {
	id: 'cfbf',
	detect: async (tokenizer: ITokenizer):  Promise<FileTypeResult | undefined> => {
		// To implement:
		// https://github.com/sindresorhus/file-type/pull/223#issuecomment-3668477211
	}
};
