import { ClientFunction } from "testcafe";

fixture`Camera Stream`.page`../webcam.html`;

test("View Mocked Stream", async (t) => {
  await t.wait(3000);
  const isVideoPlaying = ClientFunction(() => {
    const video = document.getElementById("video");
    return video.currentTime > 0;
  });
  const playing = await isVideoPlaying();
  await t.expect(playing).ok();
});
