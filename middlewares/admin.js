import config from '../config/config';
import constants from '../constants/constants';

export default (req, res, next) => {

    let user = req.decoded ;
    console.log(user);
    if(user.isAdmin) {
        next();
    } else {
        res.status(403).send({
            success: false,
            message: constants.NOT_ADMIN
        });
    }
};
