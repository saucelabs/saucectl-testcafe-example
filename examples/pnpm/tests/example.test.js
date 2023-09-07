// This test is from TestCafe example
// https://github.com/DevExpress/testcafe-examples/tree/8f4a2e3556d410d8ffe865bf06b9b887b79b7d0e/examples/change-element-style
import { ClientFunction, Selector } from 'testcafe';
import { myA } from 'testing-pnpm';

fixture `Change Element Style`
    .page `https://devexpress.github.io/testcafe/example`;

test('pnpm required module should be found', async t => {
  await t.expect(myA).eql('a123xxx');
})


test('Change header color', async t => {
    const header            = Selector('h1');
    const removeHeaderColor = ClientFunction(() => {
        document.querySelector('h1').style.color = '#111';
    });

    await t.expect(header.getStyleProperty('color')).eql('rgb(47, 164, 207)');

    await removeHeaderColor();

    await t.expect(header.getStyleProperty('color')).eql('rgb(17, 17, 17)');
});
