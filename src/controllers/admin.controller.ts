import { Request, Response } from 'express';
import linkModel from '../models/link.model';

const getLinkByID = async (req: Request, res: Response) => {
  try {
  } catch (error) {
    res
      .status(500)
      .json({
        status: 'Error',
        message: `[ERROR] Internal Server Error - ${error}`,
      });
  }
};

export { getLinkByID };
