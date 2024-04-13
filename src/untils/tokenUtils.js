// utils/tokenUtils.js
const Token = require('../models/Token');

async function deleteExpiredTokens() {
    try {
        // Tìm tất cả các token có thời gian hết hạn nhỏ hơn hoặc bằng thời gian hiện tại
        const expiredTokens = await Token.find({ expiresIn: { $lte: new Date() } });

        // Xóa các token đã hết hạn khỏi cơ sở dữ liệu
        await Token.deleteMany({ _id: { $in: expiredTokens.map(token => token._id) } });

        console.log(`${expiredTokens.length} expired tokens have been deleted.`);
    } catch (error) {
        console.error('Error deleting expired tokens:', error);
    }
}

module.exports = {
    deleteExpiredTokens
};
