import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const PagesController = () => import('#controllers/http/pages_controller')
const PortfolioController = () => import('#controllers/http/portfolio_controller')
const BlogPostsController = () => import('#controllers/http/blog_posts_controller')
const ContactInquiriesController = () => import('#controllers/http/contact_inquiries_controller')
const AdminAuthController = () => import('#controllers/http/admin_auth_controller')
const AdminS3Controller = () => import('#controllers/http/admin_s3_controller')

router.get('/', [PagesController, 'intro'])
router.get('/portfolio', [PagesController, 'portfolio'])
router.get('/portfolio/:slug', [PagesController, 'portfolioShow'])
router.get('/journey', [PagesController, 'journey'])
router.get('/blog', [PagesController, 'blogIndex'])
router.get('/blog/:slug', [PagesController, 'blogShow'])
router.get('/contact', [PagesController, 'contact'])
router.get('/admin/login', [PagesController, 'adminLogin'])

router.get('/api/portfolio', [PortfolioController, 'index'])
router.get('/api/portfolio/:slug', [PortfolioController, 'show'])
router.get('/api/journey', [PortfolioController, 'journey'])
router.get('/api/blog', [BlogPostsController, 'index'])
router.get('/api/blog/:slug', [BlogPostsController, 'show'])
router.post('/api/contact', [ContactInquiriesController, 'store'])
router.post('/api/admin/auth/login', [AdminAuthController, 'login'])

router
  .group(() => {
    router.get('/admin', [PagesController, 'adminHome'])
    router.get('/admin/blog', [PagesController, 'adminBlog'])
    router.get('/admin/portfolio', [PagesController, 'adminPortfolio'])
    router.get('/admin/s3', [PagesController, 'adminS3'])

    router.get('/api/admin/auth/me', [AdminAuthController, 'me'])
    router.post('/api/admin/auth/logout', [AdminAuthController, 'logout'])

    router.get('/api/admin/blog', [BlogPostsController, 'adminIndex'])
    router.post('/api/admin/blog', [BlogPostsController, 'store'])
    router.patch('/api/admin/blog/:id', [BlogPostsController, 'update'])
    router.delete('/api/admin/blog/:id', [BlogPostsController, 'destroy'])

    router.get('/api/admin/portfolio', [PortfolioController, 'adminIndex'])
    router.patch('/api/admin/portfolio/:id', [PortfolioController, 'adminUpdate'])

    router.get('/api/admin/s3/objects', [AdminS3Controller, 'index'])
    router.post('/api/admin/s3/upload', [AdminS3Controller, 'upload'])
    router.post('/api/admin/s3/delete', [AdminS3Controller, 'destroy'])
  })
  .use(middleware.adminAuth())
