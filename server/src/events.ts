import { addRecentChange } from "./recent.js";
import { User } from "./user.js";
import { serializeUserId } from "./util.js";

export function onUserModified(ne: User, ol: User | null): Promise<void>;
export function onUserModified(ne: User | null, ol: User): Promise<void>;
export function onUserModified(ne: User, ol: User): Promise<void>;
export async function onUserModified(ne: User | null, ol: User | null) {
  if (!ne && ol) {
    const visibleName = ol.privateInfos.name ? "名前非公開" : ol.name;
    await addRecentChange({
      type: "leave",
      targetUserName: visibleName,
    });
  } else if (ne && !ol) {
    const visibleName = ne.privateInfos.name ? "名前非公開" : ne.name;
    await addRecentChange({
      type: "new",
      targetUserId: ne.id,
      targetUserName: visibleName,
    });
  } else if (ne && ol) {
    const visibleName = ne.privateInfos.name ? "名前非公開" : ne.name;
    await addRecentChange({
      type: "modify",
      targetUserId: ne.id,
      targetUserName: visibleName,
    });
  } else {
    throw new Error("no user");
  }
}
