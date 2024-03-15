import { changeUrlData } from '../index.js';
import HorizontalHeadCount from '../components/HorizontalHeadCount.js';
import VerticalSmallButton from '../components/VerticalSmallButton.js';
import { ActivateButtons } from '../components/ActivateButtons.js';

const html = String.raw;

class GameSettingPage {
	constructor() {
		this.data = {
			battle_mode: 1,
			total_score: 2,
			level: 2,
			color: {
				paddle: '#FFFFFF',
				background: '#FFFFFF'
			}
		};
	}

	template(data = this.data) {
		this.data = data;
		const horizonbuttonConfigs = [
			{ text: '1vs1', classes: 'selected' },
			{ text: '토너먼트' }
		];
		const horizontalHeadCount = new HorizontalHeadCount(
			horizonbuttonConfigs,
			'60rem'
		);

		const virticalbuttonConfigs = [
			{ text: '세부설정', classes: 'head_blue_neon_15 blue_neon_10' },
			{ text: '시작', classes: 'head_blue_neon_15 blue_neon_10' }
		];
		const verticalSmallButton = new VerticalSmallButton(virticalbuttonConfigs);
		return html`
			<div class="game-setting-window head_white_neon_15">
				<div class="game-setting-container">
					<div class="game-setting-content-container">
						<div class="horizontalButton">
							${horizontalHeadCount.template()}
						</div>
						<div class="game-setting-nickname-container"></div>
					</div>
					<div class="verticalButton">${verticalSmallButton.template()}</div>
				</div>
			</div>
		`;
	}

	addEventListeners() {
		/* 1vs1 토너먼트 */

		ActivateButtons('.horizontalButton');

		/* 세부설정 시작 */
		const detailedButton = document.querySelector(
			'.verticalButton button:nth-child(1)'
		);
		detailedButton.addEventListener('click', () => {
			changeUrlData('gameSettingDetailed', this.data);
		});

		const startButton = document.querySelector(
			'.verticalButton button:nth-child(2)'
		);
		startButton.addEventListener('click', () => {
			// if (this.data.total_score === 1) this.data.total_score = 5;
			// else if (this.data.total_score === 2) this.data.total_score = 10;
			// else if (this.data.total_score === 3) this.data.total_score = 15;
			changeUrlData('game', this.data);
		});
	}
}

export default new GameSettingPage();
