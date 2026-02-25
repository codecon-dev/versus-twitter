import { Controller, Post, UseGuards, Req, Res, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { FastifyRequest, FastifyReply } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pump = promisify(pipeline);

@Controller('upload')
export class UploadController {
  @UseGuards(JwtAuthGuard)
  @Post()
  async uploadFile(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    try {
      if (!req.isMultipart || !req.isMultipart()) {
        return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Request is not multipart' });
      }

      const data = await req.file();
      if (!data) {
        return res.status(HttpStatus.BAD_REQUEST).send({ message: 'No file uploaded' });
      }

      // basic validation
      if (!data.mimetype.startsWith('image/')) {
        return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Invalid file type. Only images are allowed.' });
      }

      const filename = `${Date.now()}-${data.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const uploadPath = path.join(process.cwd(), 'uploads', filename);

      if (!fs.existsSync(path.dirname(uploadPath))) {
        fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
      }

      // Save the file
      await pump(data.file, fs.createWriteStream(uploadPath));

      // Return the absolute public URL
      const publicUrl = `http://localhost:3000/uploads/${filename}`;

      return res.status(HttpStatus.CREATED).send({ url: publicUrl });
    } catch (e: any) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: e.message, stack: e.stack });
    }
  }
}
