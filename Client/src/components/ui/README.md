# src/components/ui

Will contain reusable React components for ui.

Files: the source modules or assets listed for this directory in the master structure. Frontend pages and layouts will import these components. Module components may compose shared components. This directory is reserved for future shadcn UI components; no components or dependencies are generated now.

Status: Planned — functionality not implemented.

## F00-004 implementation

The planning text above is retained as history. Button, Card, Input, Badge and Dialog are now JavaScript adaptations of the [shadcn/ui Radix source components](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/ui), using scoped Radix packages and the existing Tailwind v4 setup. `Client/components.json` and the `@/` alias support future shadcn tooling without installing its CLI as an application dependency.

Button and Badge use class-variance-authority and Radix Slot composition. All five use the shared `cn` helper (clsx and tailwind-merge). Dialog uses Radix for modality, keyboard handling, focus containment/restoration and background scroll locking; CSS supplies motion with reduced-motion support. Callers must provide DialogTitle, DialogDescription and visible Input labels. The shell consumes Button, Card, Badge and Dialog; Input is available for future approved forms and adds no search workflow.

The approved light palette is centralized in theme.css. Plus Jakarta Sans Variable is self-hosted through Fontsource's normal-weight CSS import with font-display swap, Unicode subsets and system fallbacks. Writing systems outside the supplied font coverage use those fallbacks. No dark-mode policy or new semantic business status palette is implied.

### Upstream license

MIT License

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
