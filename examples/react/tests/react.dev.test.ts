import { Selector } from 'testcafe';
import { waitForReact } from 'testcafe-react-selectors';

fixture('react.dev')
  .page('https://react.dev')
  .beforeEach(async () => {
    await waitForReact();
  });

test('find useMemo reference from search bar', async (t) => {
  const searchButton = Selector('button').withText(/search/i);

  await t.click(searchButton);
  await t.typeText(
    Selector('input').withAttribute('placeholder', 'Search docs'),
    'useMemo'
  );
  await t.pressKey('enter');

  await t.expect(Selector('h1').withText('useMemo').exists).ok();
});
