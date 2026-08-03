import { BaseRepository } from "../../core/BaseRepository";
import { createResourceRouter } from "../../core/createResourceRouter";
import { asyncHandler } from "../../core/asyncHandler";
import { ApiError } from "../../core/ApiError";

/**
 * `functional_trainings` table — admin-managed per-team training links
 * shown on the frontend's Functional Training page.
 */
export const functionalTrainingsRepository = new BaseRepository("functional_trainings");

const router = createResourceRouter(functionalTrainingsRepository, "FunctionalTraining");

type FunctionalTrainingBody = {
  team?: string;
  title?: string;
  link?: string;
  sortOrder?: number;
};

/**
 * POST /api/functional_trainings
 */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as FunctionalTrainingBody;
    const { team, title, link } = body;

    if (!team?.trim() || !title?.trim() || !link?.trim()) {
      throw ApiError.badRequest("team, title, and link are required.");
    }

    const row = await functionalTrainingsRepository.insert({
      team: team.trim(),
      title: title.trim(),
      link: link.trim(),
      sort_order: typeof body.sortOrder === "number" ? body.sortOrder : 0,
    });

    res.status(201).json({ data: row });
  })
);

/**
 * PATCH /api/functional_trainings/:id
 */
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as FunctionalTrainingBody;

    const updates: Record<string, unknown> = { updated_at: new Date() };
    if (typeof body.team === "string" && body.team.trim()) updates.team = body.team.trim();
    if (typeof body.title === "string" && body.title.trim()) updates.title = body.title.trim();
    if (typeof body.link === "string" && body.link.trim()) updates.link = body.link.trim();
    if (typeof body.sortOrder === "number") updates.sort_order = body.sortOrder;

    if (Object.keys(updates).length === 1) {
      throw ApiError.badRequest("No valid fields to update (team, title, link, or sortOrder).");
    }

    const row = await functionalTrainingsRepository.update(req.params.id, updates);
    if (!row) throw ApiError.notFound(`Functional training ${req.params.id} not found`);
    res.json({ data: row });
  })
);

/**
 * DELETE /api/functional_trainings/:id
 */
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await functionalTrainingsRepository.remove(req.params.id);
    if (!deleted) throw ApiError.notFound(`Functional training ${req.params.id} not found`);
    res.json({ ok: true, id: req.params.id });
  })
);

export default router;
