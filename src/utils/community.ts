export const COMMUNITY_GATHERING_ID = 'kiwi-church-community'
export const COMMUNITY_GATHERING_NAME = 'Kiwi Church'

export function isCommunityGathering(gatheringId: string): boolean {
  return gatheringId === COMMUNITY_GATHERING_ID
}
