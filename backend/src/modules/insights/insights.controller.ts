import { asyncHandler } from '../../shared/utils/async-handler';
import { insightsService } from './insights.service';

export const insightsController = {
  get: asyncHandler(async (req, res) => {
    const data = await insightsService.getForUser(req.user?.userId ?? '');
    res.json(data);
  }),
};
