from flask import Flask, render_template, url_for, request, redirect
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sitebase.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)


class Login(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), index=True, unique=True)
    #password = db.Column(db.String(128))

    def __repr__(self):
        return '<Login {}>'.format(self.name)


class Signup(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), index=True, unique=True)
    lastname = db.Column(db.String(100), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    #password = db.Column(db.String(128))
    #age = db.Column(db.String(128))
    #sex = db.Column(db.String(128))
    #say = db.relationship('Says', backref='author', lazy='dynamic')
    #score = db.relationship('Scores', backref='author', lazy='dynamic')

    def __repr__(self):
        return '<Signup {}>'.format(self.name)


class Says(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    intro = db.Column(db.String(300), nullable=False)
    text = db.Column(db.Text, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return '<Says {}>'.format(self.title)


class Scores(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.Integer)
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return '<Says {}>'.format(self.number)


@app.route('/')
@app.route('/home')
def business():
    return render_template("business.html")


@app.route('/users')
def users():
    user = Signup.query.order_by(Signup.date.desc()).all()
    return render_template("users.html", user=user)


@app.route('/users/<int:id>')
def user_detail(id):
    users_s = Signup.query.get(id)
    return render_template("user_detail.html", users_s=users_s)


@app.route('/chess')
def chess():
    return render_template("chess.html")


@app.route('/Schulte')
def Schulte():
    return render_template("Schulte.html")


@app.route('/bingo')
def bingo():
    return render_template("bingo.html")


@app.route('/puzzles')
def puzzles():
    return render_template("puzzles.html")


@app.route('/slide_anim')
def slide_anim():
    return render_template("slide anim.html")


@app.route('/memory')
def memory():
    return render_template("memory.html")


@app.route('/paint')
def paint():
    return render_template("paint.html")


@app.route('/weat')
def weat():
    return render_template("weat.html")


@app.route('/number')
def number():
    return render_template("number.html")


@app.route('/login', methods=['POST','GET'])
def login():
    if request.method == "POST":
        name = request.form['name']
        #password = request.form['password']

        login = Login(name=name)

        try:
            db.session.add(login)
            db.session.commit()
            return redirect('/')
        except:
            return "Error"
    else:
        return render_template("login.html")


@app.route('/signup', methods=['POST','GET'])
def signup():
    if request.method == "POST":
        name = request.form['name']
        lastname = request.form['lastname']
        email = request.form['email']
        #password = request.form['password']
        #age = request.form['age']
        #sex = request.form['sex']

        signup = Signup(name=name, lastname=lastname, email=email)

        try:
            db.session.add(signup)
            db.session.commit()
            return redirect('/users')
        except:
            return "Error"
    else:
        return render_template("signup.html")


if __name__ == '__main__':
    app.run(debug = True)

