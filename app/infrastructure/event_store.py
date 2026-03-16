# TODO: Реалізувати EventStore клас для запису/читання подій з `db/events.jsonl`.
# Мінімальні вимоги для першої версії:
# - append(event): дописує одну подію в кінець файлу (JSONL, append-only)
# - read_all(): читає всі події по порядку
# - read_by_type(event_type): читає події конкретного типу
# - валідація базової структури події (`id`, `event_type`, `timestamp`, `data`)
# - гарантія що існуючі рядки не перезаписуються (тільки append)
#
# Події, які мають з'явитись найближчим часом:
# - `user_signed_up`
# - `user_signed_in`
# - `user_profile_updated`
# - `user_profile_deactivated` (коли `is_active = false`)

# {
#     "id": "123",
#     "event_type": "user_signed_up",
#     "timestamp": "2021-01-01T00:00:00Z",
#     "data": {
#         "user_id": "123",
#         "email": "test@example.com",
#         "first_name": "John",
#         "last_name": "Doe",
#         "role": "user",
#         "is_active": true,
#         "created_at": "2021-01-01T00:00:00Z",
#         "password_hash": "password_hash",
#     }
# }
# TODO: описати окремі event schema для кожного `event_type`, щоб `data` була типізована.