# Roadmap

## Release Milestones

### v1.0.0 (Oct 2025) - First Stable Release [DONE]
- 15 economic data series from FRED
- Multi-year selection with month filtering
- Interactive Recharts visualization
- Data refresh automation (fetch-data, update-data, check-sync)
- Static export to Cloudflare Pages
- Comprehensive documentation

### v1.1.0 - Enhanced Data Coverage
- Add precious metals: Gold (GOLDAMGBD228NLBM), Silver
- Add international indices: FTSE, DAX, Nikkei
- Add currency crosses: GBP/USD, USD/JPY
- Add NASDAQ Composite (NASDAQCOM)
- Add 30-Year Treasury (DGS30) for complete yield curve

### v1.2.0 - Export & Sharing
- Export charts as PNG/SVG
- Export data as CSV
- Share custom views via URL parameters

### v2.0.0 - Real-Time & Advanced Analytics
- WebSocket integration for live market data
- Correlation coefficient calculator
- Moving averages (50-day, 200-day)
- Percentage change overlay
- Custom date range picker (beyond year/month selectors)

---

## Feature Backlog

### Data & Sync
- [ ] Implement target-date synchronization strategy (align all series to T-1 business day)
- [ ] Add sync check to pre-build script
- [ ] GitHub Actions workflow for automated daily/weekly data updates
- [ ] Per-series "as of" dates in chart tooltips
- [ ] Smart retry logic for failed series updates
- [ ] Configurable max acceptable drift (env var: `DATA_SYNC_MAX_DRIFT`)

### Chart & Visualization
- [ ] Hover tooltip showing exact date for precision
- [ ] Year separator lines in multi-year view
- [ ] Year-based color coding for data points
- [ ] Dynamic font size for axis labels based on available space
- [ ] Configurable label format (user preference for date format)

### UI/UX
- [ ] Individual series tooltips showing FRED ID and update frequency
- [ ] Update schedule calendar showing when each series typically updates
- [ ] Historical drift chart to visualize sync patterns over time
- [ ] Interactive troubleshooter for common issues
- [ ] Architecture diagrams

### Infrastructure
- [ ] Add symlink verification to CI/CD
- [ ] Add `.gitattributes` for Windows symlink handling
- [ ] Data compression (gzip JSON files for ~70% size reduction)
- [ ] Split large JSON files by year if data grows beyond limits
- [ ] Consider Cloudflare R2 for large data files

### Performance
- [ ] Virtual scrolling for 10+ years of data
- [ ] Reduce label frequency for very large datasets
- [ ] Label rotation thresholds based on data volume

---

## Versioning

Follows [Semantic Versioning 2.0.0](https://semver.org/):
- **PATCH** (1.0.x): Bug fixes, docs, minor tweaks
- **MINOR** (1.x.0): New features, backwards-compatible
- **MAJOR** (x.0.0): Breaking changes

Tag every ~50 commits or significant feature. Use `npm run release` for automated tagging.

## Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/): `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
