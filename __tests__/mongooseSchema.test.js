const mongoose = require('mongoose')

const { MONGO_URL_DEV } = require('../consts')
const Post = require('../models/post')
const User = require('../models/user')
const Subject = require('../models/subject')

describe('mongoose `Post` schema', () => {
  const userData = {
    _id: '5abba8e47af4d91c259e12ef',
    password: 'test',
    username: 'User1',
    token: '001',
    email: 'User1@gql.com',
    createdAt: 1523390727,
    lastLogin: 1523390727,
    posts: ['41224d776a326fb40f000002']
  }

  const postData = {
    _id: '5abba8e47af4d91c259e12ee',
    author: userData._id,
    createdAt: 1523390727,
    editedAt: 1523390727,
    message: 'Some message'
  }

  const subjectData = {
    _id: '4abba8e47af4d91c258e12ef',
    author: '5abba8e47af4d91c259e12ef',
    createdAt: 1523390727,
    editedAt: 1523390727,
    message: 'Some other message'
  }

  beforeAll(async () => {
    await mongoose.connect(MONGO_URL_DEV)
    // clear the database
    await Post.removePosts()
    await User.removeUsers()
    await Subject.removeSubjects()
  })

  beforeEach(async () => {
    // const userInstance = new User(userData)
    // await userInstance.save()
    // const postInstance = new Post(postData)
    // await postInstance.save()
    // const subjectInsance = new Subject(subjectData)
    // await subjectInsance.save()
  })

  afterEach(async () => {
    await Post.removePosts()
    await User.removeUsers()
    await Subject.removeSubjects()
  })

  afterAll(async done => {
    await Post.removePosts()
    await User.removeUsers()
    await Subject.removeSubjects()
    await mongoose.disconnect(done)
  })

  it('should create 1 post', () => {
    const postInstance = new Post(postData)

    return postInstance.save().then(() => {
      return Post.find({}).then(result => {
        expect(result).toMatchSnapshot()
        expect(result.length).toBe(1)
      })
    })
  })

  it('should delete all posts', () => {
    expect.assertions(2)

    return Post.removePosts().then(() => {
      return Post.find({}).then(posts => {
        expect(posts.length).toBe(0)
        expect(posts).toEqual([])
      })
    })
  })

  it('should delete all subjects', () => {
    expect.assertions(2)

    return Subject.removeSubjects().then(() => {
      return Subject.find({}).then(subjects => {
        expect(subjects.length).toBe(0)
        expect(subjects).toEqual([])
      })
    })
  })

  it('should create a user and hash their password', () => {
    const username = 'User20'
    const email = 'User20@user.com'
    const password = 'test'

    return User.createUser(username, email, password).then(user => {
      expect(user.username).toBe(username)
      expect(user.email).toBe(email)
      expect(user.password).not.toBe(password)
    })
  })

  it('passwords match', () => {
    const username = 'User28'
    const email = 'User28@user.com'
    const password = 'test'

    return User.createUser(username, email, password).then(user => {
      expect(user.username).toBe(username)

      return user.comparePassword(password).then(same => {
        expect(same).toBeTruthy()
      })
    })
  })

  it('passwords do not match', () => {
    const username = 'User25'
    const email = 'User25@user.com'
    const password = 'test'
    const wrongPassword = 'tset'

    return User.createUser(username, email, password).then(user => {
      expect(user.username).toBe(username)

      return user.comparePassword(wrongPassword).then(same => {
        expect(same).not.toBeTruthy()
      })
    })
  })

  it('should get a token upon successful login', () => {
    const username = 'User200'
    const email = 'User200@user.com'
    const password = 'test'

    return User.createUser(username, email, password).then(user => {
      expect(user.username).toBe(username)

      return User.login(username, password).then(token => {
        expect(token.token.length).toBeGreaterThan(20)
      })
    })
  })

  it('should not get a token if password is incorrect', () => {
    expect.assertions(2)
    const username = 'User092'
    const email = 'User092@user.com'
    const password = 'test'
    const wrongPassword = 'tset'

    return User.createUser(username, email, password).then(user => {
      expect(user.username).toBe(username)

      return User.login(username, wrongPassword).catch(err => {
        expect(err).toMatchSnapshot()
      })
    })
  })

  it('should return different tokens for different users', () => {
    expect.assertions(1)

    const username = 'user9000'
    const username2 = 'user9000@user.com'
    const email = 'user9001'
    const email2 = 'user9001@user.com'
    const password = 'test'

    return User.createUser(username, email, password).then(user => {
      return User.createUser(username2, email2, password).then(user2 => {
        return User.login(username, password).then(token => {
          return User.login(username2, password).then(token2 => {
            expect(token.token).not.toBe(token2)
          })
        })
      })
    })
  })

  it('should verify a valid token', () => {
    const username = 'User562'
    const email = 'User562@user.com'
    const password = 'test'

    return User.createUser(username, email, password).then(user => {
      return User.login(username, password).then(token => {
        return User.verifyToken(token.token).then(valid => {
          expect(valid).toBeTruthy()
        })
      })
    })
  })

  it('should not verify an invalid token', () => {
    expect.assertions(1)

    const username = 'User652'
    const email = 'User652@user.com'
    const password = 'test'
    const notReallyAToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MjIzNDM1NjQsImV4cCI6MTUyMjQwODM2NH0.IHfxZBHvrwdETakAqbqBncg-rcvbOwRCG_zk2KFfFDunzki77aAReYHVqFTAVSwZ_C_YmlpIyUE8YXm2cIWViKeCPWuaLNd_G6yBZ9qwrBBtksFCDXWmUdLc4tJ92NzaIqwjVZtsfBRUleuWJu1MtIEIPO2gPIGA_pAvyd5zBY8fcdva4DgjBKwHKtn-2MuTwK9r_UgVE20DgLHu92sjv-qVlT6Op8hyTT5tGZjywVmlL23i7r_R7z6nBAzz1hYgVh9L7ndxNJagbOBftHzQe8mDEy0Mab9fVV8Gmr5-Il28ZTw4eCHct9Gd3LbFjuukb1kMCfkkISTUKxPmqwmAXw'

    return User.createUser(username, email, password).then(user => {
      return User.login(username, password).then(token => {
        return User.verifyToken(notReallyAToken).catch(err =>
          expect(err).toMatchSnapshot()
        )
      })
    })
  })

  it('should not create a post if subject invalid', () => {
    expect.assertions(1)

    const username = 'User322'
    const email = 'User232@user.com'
    const password = 'test'
    const badSubjectId = '4abba7e47af4d91c259e12ef'

    const message = 'Some message to save'

    return User.createUser(username, email, password).then(user => {
      return User.login(username, password).then(token => {
        return Subject.createPost(badSubjectId, token.token, message).catch(
          err => {
            expect(err).toMatchSnapshot()
          }
        )
      })
    })
  })

  it('should create a new subject given a valid token', () => {
    expect.assertions(5)

    const username = 'User222'
    const email = 'User222@user.com'
    const password = 'test'

    const message = 'Some message to save'
    const title = 'title'

    return User.createUser(username, email, password).then(user => {
      return User.login(username, password).then(token => {
        return Subject.createSubject(token.token, { message, title }).then(
          subject => {
            expect(subject.author.equals(user._id)).toBeTruthy()
            expect(subject.message).toBeDefined()
            expect(subject.title).toBeDefined()
            expect(subject.createdAt).toBeDefined()
            expect(subject.editedAt).not.toBeDefined()
          }
        )
      })
    })
  })

  it('should not create a new subject given an invalid token', () => {
    expect.assertions(1)

    const username = 'User122'
    const email = 'User212@user.com'
    const password = 'test'

    const message = 'Some message to save'
    const cheekyToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MjIzNDM1NjQsImV4cCI6MTUyMjQwODM2NH0.IHfxZBHvrwdETakAqbqBncg-rcvbOwRCG_zk2KFfFDunzki77aAReYHVqFTAVSwZ_C_YmlpIyUE8YXm2cIWViKeCPWuaLNd_G6yBZ9qwrBBtksFCDXWmUdLc4tJ92NzaIqwjVZtsfBRUleuWJu1MtIEIPO2gPIGA_pAvyd5zBY8fcdva4DgjBKwHKtn-2MuTwK9r_UgVE20DgLHu92sjv-qVlT6Op8hyTT5tGZjywVmlL23i7r_R7z6nBAzz1hYgVh9L7ndxNJagbOBftHzQe8mDEy0Mab9fVV8Gmr5-Il28ZTw4eCHct9Gd3LbFjuukb1kMCfkkISTUKxPmqwmAXw'

    return User.createUser(username, email, password).then(user => {
      return Subject.createSubject(cheekyToken, { message }).catch(err => {
        expect(err).toMatchSnapshot()
      })
    })
  })

  it('should add a response to a subject', () => {
    expect.assertions(1)

    const username = 'User22'
    const email = 'User22@user.com'
    const password = 'test'

    const message = 'Some message to save'

    return User.createUser(username, email, password).then(user =>
      User.login(username, password).then(token =>
        Subject.createSubject(token.token, { message }).then(subject =>
          Subject.createPost(subject._id, token.token, message).then(post =>
            Subject.findById(subject).then(subject =>
              expect(subject.responses[0]).toBeDefined()
            )
          )
        )
      )
    )
  })

  it('should add two responses to a post', () => {
    expect.assertions(1)
    const username = 'User22'
    const email = 'User22@user.com'
    const password = 'test'

    const message = 'Some message to save'

    return User.createUser(username, email, password).then(user => {
      return User.login(username, password).then(token => {
        return Subject.createSubject(token.token, { message }).then(subject => {
          return Subject.createPost(subject._id, token.token, message).then(
            post => {
              return Subject.createPost(subject._id, token.token, message).then(
                post2 => {
                  return Subject.findById(subject._id).then(
                    subjectsWithResponses => {
                      expect(subjectsWithResponses.responses.length).toBe(2)
                    }
                  )
                }
              )
            }
          )
        })
      })
    })
  })

  it('should not add the response to a subject when token is invalid', () => {
    expect.assertions(1)

    const username = 'User23'
    const email = 'User23@user.com'
    const password = 'test'
    const cheekyToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MjIzNDM1NjQsImV4cCI6MTUyMjQwODM2NH0.IHfxZBHvrwdETakAqbqBncg-rcvbOwRCG_zk2KFfFDunzki77aAReYHVqFTAVSwZ_C_YmlpIyUE8YXm2cIWViKeCPWuaLNd_G6yBZ9qwrBBtksFCDXWmUdLc4tJ92NzaIqwjVZtsfBRUleuWJu1MtIEIPO2gPIGA_pAvyd5zBY8fcdva4DgjBKwHKtn-2MuTwK9r_UgVE20DgLHu92sjv-qVlT6Op8hyTT5tGZjywVmlL23i7r_R7z6nBAzz1hYgVh9L7ndxNJagbOBftHzQe8mDEy0Mab9fVV8Gmr5-Il28ZTw4eCHct9Gd3LbFjuukb1kMCfkkISTUKxPmqwmAXw'

    const message = 'Some message to save'

    return User.createUser(username, email, password).then(user => {
      return Subject.createSubject(cheekyToken, { message }).catch(err => {
        expect(err).toMatchSnapshot()
      })
    })
  })

  it('should update user password', () => {
    expect.assertions(2)

    const username = 'User33'
    const email = 'user33@user.com'
    const password = 'test'
    const newPassword = 'TESTE'

    return User.createUser(username, email, password).then(user => {
      return User.login(username, password).then(token => {
        return User.updatePassword(token.token, newPassword).then(success => {
          expect(success).toBeTruthy()

          return User.login(username, newPassword).then(token => {
            expect(token.token.length).toBeGreaterThan(20)
          })
        })
      })
    })
  })

  it('should not update the password if user not authenticated', () => {
    const newPassword = 'TESTE'
    const username = 'User44'
    const email = 'User44@user.com'
    const password = 'test'
    const cheekyToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MjIzNDM1NjQsImV4cCI6MTUyMjQwODM2NH0.IHfxZBHvrwdETakAqbqBncg-rcvbOwRCG_zk2KFfFDunzki77aAReYHVqFTAVSwZ_C_YmlpIyUE8YXm2cIWViKeCPWuaLNd_G6yBZ9qwrBBtksFCDXWmUdLc4tJ92NzaIqwjVZtsfBRUleuWJu1MtIEIPO2gPIGA_pAvyd5zBY8fcdva4DgjBKwHKtn-2MuTwK9r_UgVE20DgLHu92sjv-qVlT6Op8hyTT5tGZjywVmlL23i7r_R7z6nBAzz1hYgVh9L7ndxNJagbOBftHzQe8mDEy0Mab9fVV8Gmr5-Il28ZTw4eCHct9Gd3LbFjuukb1kMCfkkISTUKxPmqwmAXw'

    return User.createUser(username, email, password).then(user => {
      return User.updatePassword(cheekyToken, newPassword).catch(err =>
        expect(err).toMatchSnapshot()
      )
    })
  })

  it('should edit subject', () => {
    expect.assertions(2)

    const message = 'message'
    const username = 'User4211'
    const email = 'User4211@user.com'
    const password = 'test'
    const newMessage = 'message225'
    const title = 'title'

    return User.createUser(username, email, password).then(user =>
      User.login(username, password).then(token =>
        Subject.createSubject(token.token, { message, title }).then(subject =>
          Subject.updateSubject(subject._id, token.token, {
            message: newMessage
          }).then(() =>
            Subject.findById(subject._id).then(subjectEdited => {
              expect(subjectEdited.message).toBe(newMessage)
              expect(subjectEdited.editedAt).toBeDefined()
            })
          )
        )
      )
    )
  })

  it('should not edit the subject given a wrong author', () => {
    expect.assertions(1)
    const message = 'message'
    const title = 'title'
    const username = 'User44'
    const email = 'User44@user.com'
    const password = 'test'
    const newMessage = 'message2'
    const newTitle = 'newTitle'

    const username2 = 'User54'
    const email2 = 'user54@user.com'

    return User.createUser(username, email, password).then(user => {
      return User.createUser(username2, email2, password).then(user2 => {
        return User.login(username, password).then(token => {
          return Subject.createSubject(token.token, { message, title }).then(
            subject => {
              return User.login(username2, password).then(token2 => {
                return Subject.updateSubject(subject._id, token2.token, {
                  message: newMessage,
                  title: newTitle
                }).catch(err => {
                  expect(err).toMatchSnapshot()
                })
              })
            }
          )
        })
      })
    })
  })

  it('should edit post message', () => {
    expect.assertions(2)
    const username = 'username'
    const email = 'email'
    const password = 'password'

    const message = 'message'
    const title = 'title'
    const newMessage = 'newMessage'

    return User.createUser(username, email, password).then(user =>
      User.login(username, password).then(token =>
        Subject.createSubject(token.token, { message, title }).then(subject =>
          Subject.createPost(subject._id, token.token, message).then(post =>
            Post.updatePost(post._id, token.token, {
              message: newMessage
            }).then(() =>
              Post.findById(post._id).then(postUpdated => {
                expect(postUpdated.message).toBe(newMessage)
                expect(postUpdated.editedAt).toBeDefined()
              })
            )
          )
        )
      )
    )
  })

  it('should not edit post message given an invalid token', () => {
    expect.assertions(1)
    const username = 'username'
    const email = 'email'
    const password = 'password'

    const message = 'message'
    const title = 'title'
    const newMessage = 'newMessage'

    const cheekyToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MjIzNDM1NjQsImV4cCI6MTUyMjQwODM2NH0.IHfxZBHvrwdETakAqbqBncg-rcvbOwRCG_zk2KFfFDunzki77aAReYHVqFTAVSwZ_C_YmlpIyUE8YXm2cIWViKeCPWuaLNd_G6yBZ9qwrBBtksFCDXWmUdLc4tJ92NzaIqwjVZtsfBRUleuWJu1MtIEIPO2gPIGA_pAvyd5zBY8fcdva4DgjBKwHKtn-2MuTwK9r_UgVE20DgLHu92sjv-qVlT6Op8hyTT5tGZjywVmlL23i7r_R7z6nBAzz1hYgVh9L7ndxNJagbOBftHzQe8mDEy0Mab9fVV8Gmr5-Il28ZTw4eCHct9Gd3LbFjuukb1kMCfkkISTUKxPmqwmAXw'

    return User.createUser(username, email, password).then(user =>
      User.login(username, password).then(token =>
        Subject.createSubject(token.token, { message, title }).then(subject =>
          Subject.createPost(subject._id, token.token, message).then(post =>
            Post.updatePost(post._id, cheekyToken, {
              message: newMessage
            }).catch(err => {
              expect(err).toMatchSnapshot()
            })
          )
        )
      )
    )
  })

  it('should not allow other users to edit the post', () => {
    expect.assertions(1)
    const username = 'username'
    const email = 'email'
    const password = 'password'

    const username2 = 'username2'
    const email2 = 'email2'

    const message = 'message'
    const title = 'title'
    const newMessage = 'newMessage'

    return User.createUser(username, email, password).then(user =>
      User.createUser(username2, email2, password).then(user2 =>
        User.login(username, password).then(token =>
          User.login(username2, password).then(token2 =>
            Subject.createSubject(token.token, { message, title }).then(
              subject =>
                Subject.createPost(subject._id, token.token, message).then(
                  post =>
                    Post.updatePost(post._id, token2.token, {
                      message: newMessage
                    }).catch(err => {
                      expect(err).toMatchSnapshot()
                    })
                )
            )
          )
        )
      )
    )
  })

  it('should delete a post', () => {
    expect.assertions(1)
    const username = 'username'
    const email = 'email'
    const password = 'password'

    const message = 'message'
    const title = 'title'

    return User.createUser(username, email, password).then(user => {
      return User.login(username, password).then(token => {
        return Subject.createSubject(token.token, { message, title }).then(
          subject => {
            return Subject.createPost(subject._id, token.token, message).then(
              post => {
                return Post.deletePost(post._id, token.token).then(success => {
                  expect(success).toBeTruthy()
                })
              }
            )
          }
        )
      })
    })
  })

  it('should not delete a post when token is invalid', () => {
    expect.assertions(1)
    const username = 'username'
    const email = 'email'
    const password = 'password'

    const message = 'message'
    const title = 'title'

    const cheekyToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MjIzNDM1NjQsImV4cCI6MTUyMjQwODM2NH0.IHfxZBHvrwdETakAqbqBncg-rcvbOwRCG_zk2KFfFDunzki77aAReYHVqFTAVSwZ_C_YmlpIyUE8YXm2cIWViKeCPWuaLNd_G6yBZ9qwrBBtksFCDXWmUdLc4tJ92NzaIqwjVZtsfBRUleuWJu1MtIEIPO2gPIGA_pAvyd5zBY8fcdva4DgjBKwHKtn-2MuTwK9r_UgVE20DgLHu92sjv-qVlT6Op8hyTT5tGZjywVmlL23i7r_R7z6nBAzz1hYgVh9L7ndxNJagbOBftHzQe8mDEy0Mab9fVV8Gmr5-Il28ZTw4eCHct9Gd3LbFjuukb1kMCfkkISTUKxPmqwmAXw'

    return User.createUser(username, email, password).then(user => {
      return User.login(username, password).then(token => {
        return Subject.createSubject(token.token, { message, title }).then(
          subject => {
            return Subject.createPost(subject._id, token.token, message).then(
              post => {
                // const response = subjectWithResponse.responses[0]
                return Post.deletePost(post._id, cheekyToken).catch(err => {
                  expect(err).toMatchSnapshot()
                })
              }
            )
          }
        )
      })
    })
  })
  it('should not delete a post when author is invalid', () => {
    expect.assertions(1)
    const username = 'username'
    const email = 'email'
    const password = 'password'

    const username2 = 'username2'
    const email2 = 'email2'

    const message = 'message'
    const title = 'title'

    return User.createUser(username, email, password).then(user => {
      return User.createUser(username2, email2, password).then(user2 => {
        return User.login(username, password).then(token => {
          return User.login(username2, password).then(token2 => {
            return Subject.createSubject(token.token, { message, title }).then(
              subject => {
                return Subject.createPost(
                  subject._id,
                  token.token,
                  message
                ).then(post => {
                  return Post.deletePost(
                    post._id,
                    // subjectWithResponseAdded.responses[0],
                    token2.token
                  ).catch(err => {
                    expect(err).toMatchSnapshot()
                  })
                })
              }
            )
          })
        })
      })
    })
  })

  it('should not delete non-existent post', () => {
    expect.assertions(1)
    const username = 'username'
    const email = 'email'
    const password = 'password'

    const message = 'message'
    const title = 'title'

    const badPostId = '507f1f77bcf86cd799439011'

    return User.createUser(username, email, password).then(user => {
      return User.login(username, password).then(token => {
        return Subject.createSubject(token.token, { message, title }).then(
          subject => {
            return Subject.createPost(subject._id, token.token, message).then(
              subjectWithResponse => {
                return Post.deletePost(badPostId, token.token).catch(err => {
                  expect(err).toMatchSnapshot()
                })
              }
            )
          }
        )
      })
    })
  })

  it('should delete a subject', () => {
    expect.assertions(1)
    const username = 'username'
    const email = 'email'
    const password = 'password'

    const message = 'message'
    const title = 'title'

    return User.createUser(username, email, password).then(user => {
      return User.login(username, password).then(token => {
        return Subject.createSubject(token.token, { message, title }).then(
          subject => {
            return Subject.deleteSubject(subject._id, token.token).then(() => {
              return Subject.findById(subject._id).then(subject => {
                expect(subject).not.toBeTruthy()
              })
            })
          }
        )
      })
    })
  })

  it('should delete a subject with all responses', () => {
    expect.assertions(2)
    const username = 'username'
    const email = 'email'
    const password = 'password'

    const message = 'message'
    const title = 'title'

    return User.createUser(username, email, password).then(user => {
      return User.login(username, password).then(token => {
        return Subject.createSubject(token.token, { message, title }).then(
          subject => {
            return Subject.createPost(subject._id, token.token, message).then(
              post => {
                expect(post).toBeDefined()

                return Subject.deleteSubject(subject._id, token.token).then(
                  () => {
                    return Post.findById(post._id).then(post => {
                      expect(post).not.toBeTruthy()
                    })
                  }
                )
              }
            )
          }
        )
      })
    })
  })

  it('should not delete subject when token is wrong', () => {
    expect.assertions(1)
    const username = 'username'
    const email = 'email'
    const password = 'password'

    const message = 'message'
    const title = 'title'

    const cheekyToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MjIzNDM1NjQsImV4cCI6MTUyMjQwODM2NH0.IHfxZBHvrwdETakAqbqBncg-rcvbOwRCG_zk2KFfFDunzki77aAReYHVqFTAVSwZ_C_YmlpIyUE8YXm2cIWViKeCPWuaLNd_G6yBZ9qwrBBtksFCDXWmUdLc4tJ92NzaIqwjVZtsfBRUleuWJu1MtIEIPO2gPIGA_pAvyd5zBY8fcdva4DgjBKwHKtn-2MuTwK9r_UgVE20DgLHu92sjv-qVlT6Op8hyTT5tGZjywVmlL23i7r_R7z6nBAzz1hYgVh9L7ndxNJagbOBftHzQe8mDEy0Mab9fVV8Gmr5-Il28ZTw4eCHct9Gd3LbFjuukb1kMCfkkISTUKxPmqwmAXw'

    return User.createUser(username, email, password).then(user => {
      return User.login(username, password).then(token => {
        return Subject.createSubject(token.token, { message, title }).then(
          subject => {
            return Subject.createPost(subject._id, token.token, message).then(
              subjectWithResponse => {
                return Subject.deleteSubject(subject._id, cheekyToken).catch(
                  err => {
                    expect(err).toMatchSnapshot()
                  }
                )
              }
            )
          }
        )
      })
    })
  })

  it('should not delete posts when author is wrong', () => {
    expect.assertions(1)
    const username = 'username'
    const email = 'email'

    const username2 = 'username2'
    const email2 = 'email2'

    const password = 'password'

    const message = 'message'
    const title = 'title'

    return User.createUser(username, email, password).then(user => {
      return User.createUser(username2, email2, password).then(user2 => {
        return User.login(username, password).then(token => {
          return User.login(username2, password).then(token2 => {
            return Subject.createSubject(token.token, { message, title }).then(
              subject => {
                return Subject.deleteSubject(subject._id, token2.token).catch(
                  err => {
                    expect(err).toMatchSnapshot()
                  }
                )
              }
            )
          })
        })
      })
    })
  })
})
