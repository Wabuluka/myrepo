import Admin from '../models/admin';
import User from '../controllers/user';
import dotenv from 'dotenv';
import validate from '../middleware/helper';
import moment from 'moment';

const admins = [];
dotenv.config();

class AdminController{
    static RegisterAdmin(req, res){
        const id = admins.length +1;
        const password = validate.hashPassword(req.body.password)
        
        const userEmail = admins.find(admin => admin.email === req.body.email);
        if(!validate.isValidEmail(req.body.email)){
            return res.status(400).json({
                'status': 400,
                'error': 'The email you provided is not valid'
            })
        }
        if (userEmail){
            return res.status(400).send({
                status: 400,
                error: "User already registered with this email!"
            })
        }
        const admin = new Admin(
            id, req.body.email, password
        )
        const token = validate.generateToken(admin.email)
        admins.push(admin);
        return res.status(201).json({
            status: 201,
            data:{
                token: token,
                id: admin.id,
                email: admin.email,
                password: admin.password,
                createdOn: admin.createdOn
            }
        })
    }

    static AdminLogin(req, res){
        const loginAdmin = admins.find(admin => admin.email === req.body.email);
        if(!loginAdmin){
            return res.status(404).send({
                status: 404,
                error: `User with  was not found`
            })
        }
        const passwordCompared = validate.comparePassword(loginAdmin.password, req.body.password);
        if(!passwordCompared){
            return res.status(401).send({
                status: 401,
                error: "Login was denied"
            });
        }
        const token = validate.generateToken(loginAdmin.email)
        return res.status(200).send({
            status: 200,
            data: {
                token: token,
                id: loginAdmin.id,
                message: "You are logged in successfully"
            } 
        })
    }

    static GetAllUsers(req, res){
        const allusers = User.users;
        if(allusers.length <= 0){
            return res.status(404).send({
                status: 404,
                message: 'No users found'
            })
        }
        return res.status(200).send({
            status: 200,
            data: allusers
        });
    }

    static GetOneUser(req, res){
        const oneUser = User.users.find(user => user.id == req.params.id);
        if(!oneUser){
            return res.status(404).send({
                status: 404,
                error: 'User not found'
            });
        }
        return res.status(200).send({
            status: 200,
            data: oneUser
        });
    }

    static CheckToMentor(req, res){
        const oneUser = User.users.find(user => user.id == req.params.id);
        if(!oneUser){
            return res.status(404).send({
                status: 404,
                error: 'User not found'
            });
        }
        const modified = moment().format('LLLL')
        oneUser.isMentor = req.body.isMentor
        oneUser.lastModified = modified
        return res.status(202).send({
            status: 202,
            oneUser 
        })
    }

    static DeleteOneUser(req, res){
        const oneUser = User.users.find(user => user.id == req.params.id);
        if(!oneUser){
            return res.status(404).send({
                status: 404,
                error: 'Not Found'
            })
        }
        const index = User.users.indexOf(oneUser)
        const removeOne = User.users.splice(index, 1)
        if(removeOne){
            return res.status(200).send({
                status: 200,
                message: 'Successfully Deleted a User'
            })
        } 
        return res.status(400).send({
            status: 400,
            message: 'Unable to delete'
        })
        
    }
}
export default {AdminController, admins};