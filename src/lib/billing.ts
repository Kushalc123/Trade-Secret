/* ------------------------------------------------------------------
   Central billing settings – edit here when prices change
-------------------------------------------------------------------*/

export const CREDIT_VALUE_INR = 10;      // one credit = ₹10 (or change)

export const ACTIVITY_COSTS = {
  /* FREE — stays at 0 */
  vision: 0,

  /* PAID workflows  (sample prices, edit as you like) -------------*/
  image_edit:             1,   // “Image Edit”
  image_edit_model:       2,   // “Image Edit + Model”
  image_edit_model_pose:  3,   // “Image Edit + Model + Pose”
  studio_retouch:         5    // “Studio Retouch”
} as const;

export type ActivityKey = keyof typeof ACTIVITY_COSTS;
