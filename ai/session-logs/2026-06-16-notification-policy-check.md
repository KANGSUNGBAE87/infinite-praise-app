# Session Log: Notification Policy Check

Date: 2026-06-16
Actor/tool: codex

## User Request

Check whether notifications are simply possible in Google Play / Android and Apps in Toss, or whether user consent is required before implementation.

## Findings

### Apps in Toss

- Notifications are possible through Apps in Toss Smart Message / Smart Sending.
- It should not be treated as arbitrary client-side push from the mini app.
- Push/notification message templates require review, and the documented review time is 2-3 business days.
- Marketing messages can only be sent to users who agreed to marketing reception and are sent by segment.
- For functional messages, whether a notification agreement is required depends on message nature.
- Service-essential messages such as payment completion, shipping, refund, information change, and terms changes can be sent without an additional notification agreement.
- If a user chooses to receive a specific notification, the app must request notification agreement first through `requestNotificationAgreement`.
- For this app, reminders like daily encouragement / return nudges are not essential transactional messages. Treat them as opt-in reminders or marketing/retention messages and design explicit consent plus opt-out UX.

Official references:

- Apps in Toss Smart Message: https://developers-apps-in-toss.toss.im/smart-message/intro.html
- Apps in Toss requestNotificationAgreement: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EC%9D%B8%ED%84%B0%EB%A0%89%EC%85%98/requestNotificationAgreement.html
- Apps in Toss Smart Message development: https://developers-apps-in-toss.toss.im/smart-message/develop.html

### Google Play / Android

- Android apps can send notifications, but Android 13 / API 33 and higher require the `POST_NOTIFICATIONS` runtime permission for non-exempt notifications.
- The permission must be declared in `AndroidManifest.xml`, requested at the right moment, and respected if denied.
- New installs on Android 13+ have notifications off by default until permission is granted.
- Google Play Data safety is separate from the runtime notification permission. Every Play app must complete the Data safety form, and the declaration must accurately reflect all app and SDK data collection/sharing.
- If notifications are local-only and no user data is sent off-device, Data safety is simpler. If using push infrastructure such as FCM, analytics, user IDs, device tokens, or third-party SDKs, those practices must be reflected accurately.

Official references:

- Android notification runtime permission: https://developer.android.com/develop/ui/compose/notifications/notification-permission
- Google Play Data safety form: https://support.google.com/googleplay/android-developer/answer/10787469
- Android declare data use guidance: https://developer.android.com/privacy-and-security/declare-data-use

## Product Decision

Keep notification UI as `preview_only` until implementation. Before real notifications, choose the target platform and message type:

1. Apps in Toss opt-in reminder via Smart Message agreement.
2. Apps in Toss marketing/retention campaign via marketing consent and segment.
3. Android local notification with `POST_NOTIFICATIONS` permission.
4. Android remote push with FCM plus Data safety updates.

For `칭찬해줘`, the safest first real implementation is a user-triggered opt-in reminder, not broad marketing push.

## 2026-06-16 Follow-up: Risky Nagging Copy

User request:

- Check whether user-entered nagging phrases such as "넌 왜 맨날 이러냐.", "한심하다.", and "이러니까 안 되는 거야." could cause Apps in Toss or Google Play review issues when sent as notifications.

Decision:

- Do not allow person-attacking nagging copy to be scheduled or delivered as notification text.
- Treat these phrases as blocked or rewrite-required content, even when the user typed them for personal use.
- The product rule is: do not attack the person; push only the next behavior.

Policy rationale:

- Apps in Toss non-game release guidance says mini app copy should not include profanity, slang, or excessive trend language, and should not include illegal or sexually explicit content. The UI/UX guide also requires predictable, trustworthy UX writing and Apps in Toss Smart Message content must pass copy review before sending.
- Apps in Toss Smart Message requires title/content templates, message context, and in many opt-in cases notification agreement. Template review happens before message sending.
- Google Play Inappropriate Content policy prohibits apps that contain or facilitate threats, harassment, or bullying. Google Play UGC policy requires moderation safeguards for user-generated content and names harassment/bullying safeguards as a common concern.
- If AI generates or rewrites notification copy, Google Play AI-generated content policy requires in-app reporting/flagging for offensive AI-generated content.

Implementation guidance:

- Add copy safety categories before real notification release:
  - `allowed`: supportive, action-focused copy.
  - `rewrite`: harsh but salvageable copy; convert to behavior-focused wording.
  - `blocked`: direct insults, shame, threats, harassment, self-harm encouragement, discriminatory or sexual content.
- Keep notification preview local until platform notification integration is ready.
- If user-entered text is used in Apps in Toss Smart Message variables, do not pass arbitrary raw text into visible notification title/content. Use reviewed templates and sanitized short variables only.

Safer rewrite examples:

- "넌 왜 맨날 이러냐." -> "지금 한 가지만 다시 시작해요."
- "한심하다." -> "잠깐 멈추고, 다음 행동 하나만 해요."
- "이러니까 안 되는 거야." -> "이번에는 방법을 바꿔서 다시 해봐요."

Official references checked:

- Apps in Toss UI/UX Guide: https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.html
- Apps in Toss Non-game Launch Guide: https://developers-apps-in-toss.toss.im/checklist/app-nongame.html
- Apps in Toss Service Open Policy: https://developers-apps-in-toss.toss.im/intro/guide.html
- Apps in Toss Smart Message: https://developers-apps-in-toss.toss.im/smart-message/intro.html
- Apps in Toss Smart Message API: https://developers-apps-in-toss.toss.im/smart-message/develop.html
- Google Play Inappropriate Content: https://support.google.com/googleplay/android-developer/answer/9878810
- Google Play User Generated Content: https://support.google.com/googleplay/android-developer/answer/9876937
- Google Play AI-Generated Content: https://support.google.com/googleplay/android-developer/answer/13985936
