import { ObjectId } from 'mongodb';
import UserUtils from '../utils/user';
import fileUtils from '../utils/file';
import basicUtils from '../utils/basic';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const { userId } = await UserUtils.getUserIdAndKey(req);

    if (!basicUtils.isValid(userId)) return res.status(401).send({ error: 'Unauthorized' });

    const user = await UserUtils.getUser({ _id: ObjectId(userId) });
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const { error: ValidationError, fileParams } = await fileUtils.validateBody(req);
    if (ValidationError) return res.status(400).send({ error: ValidationError });

    if (fileParams.parentId !== 0 && !basicUtils.isValid(fileParams.parentId)) {
      return res.status(400).send({ error: 'Parent not found' });
    }

    const { newFile } = await fileUtils.saveFile(userId, fileParams, FOLDER_PATH);

    return res.status(201).send(newFile);
  }
}

export default FilesController;
