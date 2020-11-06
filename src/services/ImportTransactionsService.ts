import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import uploadConfig from '../config/upload';

interface Request {
  file: Express.Multer.File;
}

interface Response {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

async function loadCSV(filePath: string): Promise<any[]> {
  const readCSVStream = fs.createReadStream(filePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines: any[] = [];

  parseCSV.on('data', line => {
    lines.push(line);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}

class ImportTransactionsService {
  async execute({ file }: Request): Promise<Response[]> {
    const csvFilePath = path.resolve(uploadConfig.directory, file.filename);

    const data = await loadCSV(csvFilePath);

    const transactions = data.map(transaction => {
      return {
        title: transaction[0] as string,
        type: transaction[1] as 'income' | 'outcome',
        value: transaction[2] as number,
        category: transaction[3] as string,
      };
    });

    return transactions;
  }
}

export default ImportTransactionsService;
