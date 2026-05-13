import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true ,minlength: 6},
  email: { type: String, required: true, unique: true ,lowercase: true, trim: true},
  createdAt: { type: Date, default: Date.now },
  avatar:{ type: String, default: false, },
  morningMotivation:{ type: Boolean, default:false},
  

});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  }
  catch (err) {
    next(err);
  }
});



userSchema.methods.matchPassword = async function (candidatePassword) {
return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;