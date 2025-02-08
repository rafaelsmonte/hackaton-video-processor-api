# API

> Version 1.0.0

API documentation for the Video Processor API Service.

## Path Table

| Method | Path                                     | Description            |
| ------ | ---------------------------------------- | ---------------------- |
| GET    | [/videos](#getvideos)                    | Retrieve all videos    |
| POST   | [/videos](#postvideos)                   | Upload a new video     |
| GET    | [/videos/{id}](#getvideosid)             | Retrieve video by ID   |
| POST   | [/videos/{id}/retry](#postvideosidretry) | Retry video processing |

---

### [GET]/videos

- Summary  
  Retrieve all videos

#### Headers

```json
x-user-id: string
```

#### Responses

- 200 List of videos

`application/json`

```json
{
  id: string
  createdAt: string
  updatedAt: string
  userId: string
  description: string
  url: string
  snapshojsonUrl: string
  status: enum[VIDEO_IMAGE_EXTRACTION_REQUESTED, VIDEO_IMAGE_EXTRACTION_PENDING, VIDEO_IMAGE_EXTRACTION_PROCESSING, VIDEO_IMAGE_EXTRACTION_SUCCESS, VIDEO_IMAGE_EXTRACTION_ERROR]
}[]
```

---

### [POST]/videos

- Summary  
  Upload a new video

#### Headers

```json
x-user-id: string
```

#### RequestBody

- multipart/form-data

```json
{
  video: string; // The video file to upload.
  description: string; // Description of the video.
}
```

#### Responses

- 200 Video uploaded successfully.

`application/json`

```json
{
  id: string
  createdAt: string
  updatedAt: string
  userId: string
  description: string
  url: string
  snapshojsonUrl: string
  status: enum[VIDEO_IMAGE_EXTRACTION_REQUESTED, VIDEO_IMAGE_EXTRACTION_PENDING, VIDEO_IMAGE_EXTRACTION_PROCESSING, VIDEO_IMAGE_EXTRACTION_SUCCESS, VIDEO_IMAGE_EXTRACTION_ERROR]
}
```

- 400 Invalid request (missing file or user ID).

---

### [GET]/videos/{id}

- Summary  
  Retrieve video by ID

#### Headers

```json
x-user-id: string
```

#### Responses

- 200 Video details

`application/json`

```json
{
  id: string
  createdAt: string
  updatedAt: string
  userId: string
  description: string
  url: string
  snapshojsonUrl: string
  status: enum[VIDEO_IMAGE_EXTRACTION_REQUESTED, VIDEO_IMAGE_EXTRACTION_PENDING, VIDEO_IMAGE_EXTRACTION_PROCESSING, VIDEO_IMAGE_EXTRACTION_SUCCESS, VIDEO_IMAGE_EXTRACTION_ERROR]
}
```

- 404 Video not found.

---

### [POST]/videos/{id}/retry

- Summary  
  Retry video processing

#### Headers

```json
x-user-id: string
```

#### Responses

- 200 Video processing retried successfully.

`application/json`

```json
{
  id: string
  createdAt: string
  updatedAt: string
  userId: string
  description: string
  url: string
  snapshojsonUrl: string
  status: enum[VIDEO_IMAGE_EXTRACTION_REQUESTED, VIDEO_IMAGE_EXTRACTION_PENDING, VIDEO_IMAGE_EXTRACTION_PROCESSING, VIDEO_IMAGE_EXTRACTION_SUCCESS, VIDEO_IMAGE_EXTRACTION_ERROR]
}
```

- 404 Video not found.
