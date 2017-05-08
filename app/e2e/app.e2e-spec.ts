import { OsconPage } from './app.po';

describe('oscon App', () => {
  let page: OsconPage;

  beforeEach(() => {
    page = new OsconPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
