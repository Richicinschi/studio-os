# Event starter lists

Pick the rows that match a decision. Trim the rest.

## Marketing site

| Event | Meaning | Properties |
|---|---|---|
| page_view | Page loaded, with extras | page_title, page_location, content_group |
| scroll_depth | Reached 25, 50, 75 or 100 percent | depth |
| outbound_link_clicked / internal_link_clicked | Left for another site / moved within the site | link_url, link_text, location |
| video_started / video_finished | Playback began / ended | video_id, video_title |
| cta_clicked | Call to action pressed | button_text, cta_location, page |
| form_started / form_field_completed / form_submitted / form_error | Form lifecycle | form_name, form_location, field_name, error_type |
| resource_downloaded | File fetched | resource_name, resource_type |
| signup_started / signup_completed | Account flow | method, plan, source |
| demo_requested, contact_submitted | Lead forms | company_size, inquiry_type |
| newsletter_subscribed | List join | source, list_name |
| trial_started | Trial begins | plan, source |

## Product or app

Onboarding: `onboarding_started`, `onboarding_step_completed` (step_number, step_name), `onboarding_completed` (time_to_complete), `onboarding_skipped` (step_skipped_at), `first_key_action_completed` (action_type, the "aha" moment).

Usage: `session_started`, `feature_used` (feature_name), `action_completed` (action_type, count), `content_created` / `content_edited` / `content_deleted` (content_type), `search_performed` (query length, results_count), `settings_changed`, `invite_sent`.

Trouble: `error_occurred` (error_type, page), `help_opened`, `support_contacted`, `feedback_submitted` (rating).

## Money

`pricing_viewed`, `plan_selected` (plan_name, billing_cycle), `checkout_started`, `payment_info_entered`, `purchase_completed` (plan, value, currency, transaction_id), `purchase_failed`, `trial_ended` (converted), `subscription_upgraded`, `subscription_downgraded`, `subscription_cancelled` (reason, tenure), `subscription_renewed`, `billing_updated`.

## Shop

Browse: `product_viewed`, `product_list_viewed`, `product_searched`, `product_filtered`, `product_sorted`. Cart: `product_added_to_cart`, `product_removed_from_cart`, `cart_viewed`. Checkout: `checkout_started`, `shipping_info_entered`, `payment_info_entered`, `coupon_applied`, `purchase_completed`. After: `order_confirmed`, `refund_requested`, `refund_completed`, `review_submitted`.

## Team products

`team_created`, `team_member_invited`, `team_member_joined`, `team_member_removed`, `role_changed`, `integration_viewed` / `integration_started` / `integration_connected` / `integration_disconnected`, `account_created`, `account_upgraded`, `account_churned` (reason, tenure), `account_reactivated`.

## Shared property shapes

- User: `user_id`, `user_type` (free, trial, paid), `account_id`, `plan_type`. Use opaque ids, never emails.
- Session: `session_id`, `session_number`, `page`, `referrer`.
- Campaign: `source`, `medium`, `campaign`, `content`.
- Product: `product_id`, `product_name`, `category`, `price`, `quantity`, `currency`.
- Timing: `timestamp` in UTC ISO form, `time_on_page` and `session_duration` in seconds.

## Funnels worth defining

- Signup: `signup_started`, `signup_step_completed` per field group, `signup_completed`, `onboarding_started`.
- Purchase: `pricing_viewed`, `plan_selected`, `checkout_started`, `payment_info_entered`, `purchase_completed`.
- Shop: `product_viewed`, `product_added_to_cart`, `cart_viewed`, `checkout_started`, `shipping_info_entered`, `payment_info_entered`, `purchase_completed`.

Confirm every step fires before reading drop-off rates.
