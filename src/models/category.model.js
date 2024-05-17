const mongoose = require('mongoose');

// Định nghĩa schema cho collection "categories"
const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  photo: String
});

// Tạo model từ schema
const Category = mongoose.model('Category', categorySchema);

// Xuất model để có thể sử dụng trong các module khác
module.exports = Category;
