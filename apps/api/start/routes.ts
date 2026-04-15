import router from '@adonisjs/core/services/router'

const PortfolioController = () => import('#controllers/http/portfolio_controller')
const BlogPostsController = () => import('#controllers/http/blog_posts_controller')
const ContactInquiriesController = () => import('#controllers/http/contact_inquiries_controller')

router.get('/api/portfolio', [PortfolioController, 'index'])
router.get('/api/journey', [PortfolioController, 'journey'])

router.get('/api/blog', [BlogPostsController, 'index'])
router.get('/api/blog/:slug', [BlogPostsController, 'show'])

router.post('/api/contact', [ContactInquiriesController, 'store'])

router.group(() => {
  router.post('/blog', [BlogPostsController, 'store'])
  router.patch('/blog/:id', [BlogPostsController, 'update'])
}).prefix('/api/admin')
