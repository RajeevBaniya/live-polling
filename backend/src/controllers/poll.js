const Poll = require("../models/pollModel");

exports.createPoll = async (pollData) => {
  let newPoll = await Poll(pollData);
  newPoll.save();
  return newPoll;
};

exports.voteOnOption = async (pollId, optionText, studentAnswer) => {
  try {
    const poll = await Poll.findOneAndUpdate(
      { _id: pollId, "options.text": optionText },
      { $inc: { "options.$.votes": 1 } },
      { new: true }
    );

    // Check if the selected option is correct
    if (poll) {
      const selectedOption = poll.options.find(
        (opt) => opt.text === optionText
      );
      if (selectedOption) {
        studentAnswer.isCorrect = selectedOption.correct;
      }
    }

    console.log("Vote registered successfully:", poll);
    return studentAnswer;
  } catch (error) {
    console.error("Error registering vote:", error);
    return null;
  }
};

exports.getPolls = async (req, res) => {
  let { teacherUsername } = req.params;
  let data = await Poll.find({ teacherUsername });
  res.status(200).json({
    data,
  });
};
