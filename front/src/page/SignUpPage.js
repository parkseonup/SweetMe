/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import _ from 'lodash';
import Component from '../core/Component';
import { SignUp, hide, submitButton } from '../component/SignUp';
import { signupSchema } from '../validation/schema';
import Toaster from '../component/Toaster';

class SignUpPage extends Component {
  constructor(props) {
    super(props);

    this.changePath = this.props.changePath;
  }

  render() {
    const signUp = new SignUp({
      valid: _.debounce(this.valid.bind(this), 200),
      postSignUp: this.postSignUp.bind(this),
      changePath: this.changePath.bind(this),
    }).render();

    const toaster = new Toaster({
      ...this.state,
      type: `${this.state?.result}`,
      message: this.state?.isResultSuccess ? '회원가입이 성공했습니다.' : '이미 사용중인 이메일 입니다.',
      changePath: this.changePath,
      pageUrl: this.state?.isResultSuccess ? '/signin' : null,
      changeIsToasterShowing: this.changeIsToasterShowing.bind(this),
    }).render();

    // 컴포넌트 만들자!!
    return `
      ${signUp}
      ${this.state?.isToastShowing ? toaster : ''}
      `;
  }

  // eslint-disable-next-line class-methods-use-this
  toggleSubmitButton() {
    document.querySelector(`.${submitButton}`).disabled = !signupSchema.valid;
  }

  /* ------------------------------ Event Handler ----------------------------- */

  /** input 이벤트 발생시 유효성 검사를 진행 */
  // eslint-disable-next-line class-methods-use-this
  valid(e) {
    signupSchema[e.target.name].value = e.target.value;
    signupSchema[e.target.name].dirty = true;

    e.target.nextElementSibling.classList.toggle(hide, signupSchema[e.target.name].valid);

    if (e.target.name === 'password' && signupSchema.confirmPassword.dirty) {
      document
        .querySelector('input[name="confirmPassword"]')
        .nextElementSibling.classList.toggle(hide, signupSchema.confirmPassword.valid);
    }

    this.toggleSubmitButton();
  }

  changeIsToasterShowing(result) {
    this.isResultSuccess = result === 'success';
    this.isToastShowing = !this.isToastShowing;
    this.setState({ isToastShowing: this.isToastShowing });
  }

  /**
   * submit 이벤트 발생시 서버에서 이미 회원가입된 유저인지 확인
   * - 중복된 이메일이면 fail toaster 띄우기
   * - 새로운 회원이면 success toaster 띄우기
   * TODO: postSignUp이라는 네이밍이 괜찮은지 코드 리뷰
   */
  async postSignUp() {
    const email = signupSchema.email.value;
    const userName = signupSchema.userName.value;
    const password = signupSchema.password.value;

    try {
      // prettier-ignore
      await axios.post(
        `/api${this.props.path}`, 
        { email, userName, password }
      );
      console.log(`[Toaster] ${userName}님의 회원가입이 완료되었습니다!`);
      this.changeIsToasterShowing('success');
    } catch (error) {
      this.changeIsToasterShowing();
      console.log('[Toaster] 이미 가입된 회원입니다');
    }
  }
}

export default SignUpPage;
