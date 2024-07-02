import { ObjectId } from 'mongodb';
import UserUtils from '../utils/user';
import fileUtils from '../utils/file';
import basicUtils from '../utils/basic';
import dbClient from '../utils/db';

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

  /**
   * getShow retrieve files based on the token
   * @param {*} req - request
   * @param {*} res - response
   * @returns file document is linked to the user and the Id passed
   * as parameter, otherwise return an error Not found.
   */
  static async getShow(req, res) {
    const { fileId } = req.params.id;
    const { userId } = await UserUtils.getUserIdAndKey(req);

    if (!basicUtils.isValid(userId)) return res.status(401).send({ error: 'Unauthorized' });

    const user = await UserUtils.getUser({ _id: ObjectId(userId) });
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    // Check for id
    if (!basicUtils.isValid(fileId) || !basicUtils.isValid(userId)) return res.status(404).send({ error: 'Not found' });

    const result = await fileUtils.getFile({ _id: ObjectId(fileId), userId: ObjectId(userId) });
    if (!result) return res.status(404).send({ error: 'Not Found' });

    const file = await fileUtils.processFile(result);

    return res.status(200).send(file);
  }

  static async getIndex(req, res) {
    const { userId } = await UserUtils.getUserIdAndKey(req);

    if (!basicUtils.isValid(userId)) return res.status(401).send({ error: 'Unauthorized' });

    const user = await UserUtils.getUser({ _id: ObjectId(userId) });
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    let parentId = req.query.parentId || '0';

    if (parentId === '0') parentId = 0;

    let page = Number(req.query.page) || 0;

    if (Number.isNaN(page)) page = 0;

    if (parentId !== 0 && parentId !== '0') {
      if (!basicUtils.isValid(parentId)) return res.status(401).send({ error: 'Unauthorized' });

      parentId = ObjectId(parentId);

      const folder = await fileUtils.getFile({ _id: ObjectId(parentId) });

      if (!folder || folder.type !== 'folder') return res.status(200).send([]);
    }

    const paginationPipeline = [
      { $match: { parentId } },
      { $skip: page * 20 },
      { $limit: 20 },
    ];

    const aggregate = await dbClient.filesCollection.aggregate(paginationPipeline);

    const fileList = [];
    await aggregate.forEach((doc) => {
      const document = fileUtils.processFile(doc);
      fileList.push(document);
    });

    return res.status(200).send(fileList);
  }
}

export default FilesController;
