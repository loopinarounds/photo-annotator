export function generateLiveblocksUserId(prefix = "user"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

export function generateLiveblocksRoomId(): string {
  return generateLiveblocksUserId("room");
}
