# Arcadia on GitHub Pages

Arcadia and Arcadia Creator are static for the current alpha. Everyone can build and export a game without an Arcadia developer account.

## Enable GitHub Pages (one-time repository setting)

1. Open https://github.com/miami1822/arcadia-games/settings/pages
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Select **main** as the branch and **/(root)** as the folder, then click **Save**.
4. When GitHub reports that publishing succeeded, open:
   - https://miami1822.github.io/arcadia-games/
   - https://miami1822.github.io/arcadia-games/creator.html
   - https://miami1822.github.io/arcadia-games/school.html

Those are conventional project-site URLs; they are **not verified as live until GitHub Pages reports a successful deployment**. Repository-admin GitHub Pages settings cannot currently be changed by the available GitHub connector.

The repository has the site files at the root and includes `.nojekyll`. No external build tool, custom deployment workflow, or extra repository is required.

## Updates

Commits to `main` are deployed by GitHub Pages once the source is configured. The static site uses relative asset paths so it also works in a project path like `/arcadia-games/`.

## Account-free creation and staff-managed publishing

1. Anyone can open `creator.html` with no sign-in.
2. Create a game using the visual editor, code editor, or HTML/ZIP importer.
3. Test it and export the package as ZIP.
4. Send the package to Arcadia staff outside the site for manual review.
5. Staff confirm content and distribution rights, then commit an approved game and its catalog entry to GitHub.

Creator drafts use local browser storage; **they do not sync through GitHub or follow visitors between browsers**. Export ZIP backups regularly. There is no automatic public upload or publishing endpoint.

## Safety and operations

Do not let unreviewed anonymous game packages write directly into this public repository or execute with privileged Arcadia origin access. Approval for the Main Edition does not imply School Edition approval.

Keep the old Render deployment available until GitHub Pages is confirmed live and the library, game player, and Creator have passed basic smoke tests.
