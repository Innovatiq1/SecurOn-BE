import OemModel from '../model/oemSchema.js';

export const getOemCveFixData = async (request, response) => {
    try {

        let where = {
            cve: request.params.cve
        };

        const oemData = await OemModel.find(where);

        response.json(oemData);
    } catch (error) {
        console.log("error is" + error);
    }
};


