import { asyncHandler } from '../../shared/utils/async-handler';
import { alertService } from './alert.service';

export const alertController = {
  list: asyncHandler(async (req, res) => {
    const alerts = await alertService.list(req.user?.userId ?? '');
    res.json({ alerts });
  }),

  markRead: asyncHandler(async (req, res) => {
    const alert = await alertService.markRead(req.user?.userId ?? '', req.params.id ?? '');
    res.json({ alert });
  }),
};
