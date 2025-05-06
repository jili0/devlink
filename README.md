# DevLink

A clean, minimalist application to manage and organize your development links in different categories.

## Features

- Clean, minimalist admin panel design
- Organize links in five categories: Work, Utils, Design, Others, Projects
- Drag-and-drop functionality for easy reorganization
- Inline editing of links
- Authentication for protected actions (edit, delete, reorder)
- Responsive design with adaptive column layout
- MongoDB database storage

## Getting Started

### Prerequisites

- Node.js 14+ installed
- MongoDB database (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/devlink.git
cd devlink
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

4. Create an admin user
```bash
node scripts/create-admin.js
```
This will create an admin user with the username `admin` and password `adminpassword`. Make sure to change this password in production.

5. Start the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

- **Viewing Links**: All links are visible without logging in
- **Adding Links**: Use the form at the top of the page
- **Editing Links**: Login required, hover over a link to see the edit button
- **Deleting Links**: Login required, hover over a link to see the delete button
- **Reordering Links**: Login required, use drag and drop to reorder links

## Build for Production

```bash
npm run build
npm start
```

## Deployment

You can deploy this application to Vercel, Netlify, or any other Next.js compatible hosting service.

## License

MIT