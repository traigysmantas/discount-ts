import { getInputFile } from './get-input-file';
import { readFile } from 'fs/promises';
import { join } from 'path';

jest.mock('fs/promises');
jest.mock('path');

describe(`${getInputFile.name}`, () => {
  beforeEach(() => {
    jest.mocked(readFile).mockResolvedValueOnce(`2015-02-01 S MR\n2015-02-02 S MR`);
  });

  it('joins file path with default file input', async () => {
    await getInputFile();

    expect(join).toHaveBeenCalledWith(__dirname, '../../input.txt');
  });

  it('joins file path with provided file input', async () => {
    await getInputFile('/file/another-input.txt');

    expect(join).toHaveBeenCalledWith(__dirname, '/file/another-input.txt');
  });

  it('returns string split by new line', async () => {
    const result = await getInputFile('/file/another-input.txt');

    expect(result).toEqual(['2015-02-01 S MR', '2015-02-02 S MR']);
  });
});
