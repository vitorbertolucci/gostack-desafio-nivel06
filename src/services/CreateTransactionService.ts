import { getCustomRepository, getRepository } from 'typeorm';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionRepository);

    let category_id = '';

    if (type === 'outcome') {
      const { total: balance } = await transactionsRepository.getBalance();
      if (value > balance) {
        throw new AppError('Insuficient balance.', 400);
      }
    }

    const existentCategory = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    if (existentCategory) {
      category_id = existentCategory.id;
    } else {
      const newCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(newCategory);

      category_id = newCategory.id;
    }

    const newTransaction = transactionsRepository.create({
      category_id,
      title,
      type,
      value,
    });

    await transactionsRepository.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;
