import { PamplonaUiPage } from './app.po';

describe('pamplona-ui App', () => {
  let page: PamplonaUiPage;

  beforeEach(() => {
    page = new PamplonaUiPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
