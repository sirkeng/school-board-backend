# School Board Portal

## Setting Up File Upload Directories

This project requires specific folders to store uploaded images and videos for sports and other related entities. Make sure to create the necessary directories before running the application to avoid runtime errors.

### Required Folders

-   **Images**: All images related to sports will be stored in the `public/uploads/images` directory.
-   **Videos**: All videos will be stored in the `public/uploads/videos` directory.

### Steps to Create Folders

To create these folders, you can run the following command from the project root:

```bash
mkdir -p public/uploads/images public/uploads/videos
```

This command will create the appropriate directories (`public/uploads/images` and `public/uploads/videos`) if they do not already exist.

### Folder Structure

After creating the folders, the structure should look like this:

```
/your-project-root
  ├── /public
  │     └── /uploads
  │           ├── /images
  │           └── /videos
  ├── /src
  ├── package.json
  └── ...
```

### Important Notes

-   The folders must be created before running the server to allow successful uploads of images and videos.
-   If the folders are missing, attempts to upload files will result in errors, as the paths specified in the `uploadLocal` middleware will not be valid.

### Middleware for File Uploads

-   The file upload middleware is configured in `src/middlewares/uploadLocal.ts`. It uses different folders for images and videos based on the file type.
-   Make sure the folders are set up correctly to ensure that uploaded files are saved in their respective locations.
