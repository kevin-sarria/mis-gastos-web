import type { Request } from 'express';
import multer from 'multer';
import { ValidationError } from '../../shared/errors/app-error';
import { asyncHandler } from '../../shared/utils/async-handler';
import { fileService } from './file.service';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function attachmentUrl(req: Request, storageKey: string): string {
  return `${req.protocol}://${req.get('host')}/uploads/${storageKey}`;
}

export const fileController = {
  upload: [
    upload.single('file'),
    asyncHandler(async (req, res) => {
      if (!req.file) {
        throw new ValidationError('No se envió ningún archivo');
      }
      const attachment = await fileService.attachToExpense(
        req.user?.userId ?? '',
        req.params.expenseId ?? '',
        {
          buffer: req.file.buffer,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
        },
      );
      res.status(201).json({
        attachment: { ...attachment, url: attachmentUrl(req, attachment.storageKey) },
      });
    }),
  ],

  list: asyncHandler(async (req, res) => {
    const attachments = await fileService.listForExpense(
      req.user?.userId ?? '',
      req.params.expenseId ?? '',
    );
    res.json({
      attachments: attachments.map((attachment) => ({
        ...attachment,
        url: attachmentUrl(req, attachment.storageKey),
      })),
    });
  }),

  remove: asyncHandler(async (req, res) => {
    await fileService.remove(req.user?.userId ?? '', req.params.id ?? '');
    res.status(204).send();
  }),
};
